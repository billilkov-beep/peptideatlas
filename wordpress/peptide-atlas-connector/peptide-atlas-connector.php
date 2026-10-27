<?php
/**
 * Plugin Name: Peptide Atlas Connector
 * Description: Connects this website to a central Peptide Atlas knowledge base, with a shared human viewer and local branding.
 * Version: 1.2.0
 * Requires at least: 6.4
 * Requires PHP: 8.0
 * Author: Peptide Atlas
 * License: GPL-2.0-or-later
 * Text Domain: peptide-atlas
 */

if (!defined('ABSPATH')) { exit; }

final class Peptide_Atlas_Connector {
    const VERSION = '1.2.0';
    const SETTINGS = 'peptide_atlas_settings';
    const SNAPSHOT = 'peptide_atlas_snapshot';
    const STATUS = 'peptide_atlas_status';
    const CRON = 'peptide_atlas_refresh';
    const LOCK = 'peptide_atlas_sync_lock';
    const MAX_AGE = 86400;

    public static function categories() {
        return array('brain'=>'Brain & sleep', 'skin'=>'Skin & aging', 'digestive'=>'Digestive & metabolism', 'immune'=>'Immune system', 'hormones'=>'Hormones', 'musculoskeletal'=>'Bones & muscles', 'cardiovascular'=>'Heart & circulation', 'reproductive'=>'Reproductive system');
    }

    public static function boot() {
        add_filter('cron_schedules', array(__CLASS__, 'schedules'));
        add_action(self::CRON, array(__CLASS__, 'sync'));
        add_action('init', array(__CLASS__, 'routes'));
        add_filter('query_vars', function($vars) { $vars[] = 'atlas_peptide'; return $vars; });
        add_action('template_redirect', array(__CLASS__, 'profile_route'), 1);
        add_action('admin_menu', array(__CLASS__, 'menu'));
        add_action('admin_post_peptide_atlas_save', array(__CLASS__, 'save'));
        add_action('admin_post_peptide_atlas_sync', array(__CLASS__, 'manual_sync'));
        add_action('admin_post_peptide_atlas_disconnect', array(__CLASS__, 'disconnect'));
        add_shortcode('peptide_atlas', array(__CLASS__, 'shortcode'));
    }

    public static function schedules($schedules) {
        $schedules['peptide_atlas_15m'] = array('interval'=>900, 'display'=>'Every 15 minutes (Peptide Atlas)');
        return $schedules;
    }

    public static function routes() {
        add_rewrite_rule('^atlas-peptides/([a-z0-9-]+)/?$', 'index.php?atlas_peptide=$matches[1]', 'top');
    }

    public static function activate() {
        self::routes();
        if (!wp_next_scheduled(self::CRON)) { wp_schedule_event(time() + 30, 'peptide_atlas_15m', self::CRON); }
        flush_rewrite_rules();
    }

    public static function deactivate() { wp_clear_scheduled_hook(self::CRON); delete_option(self::LOCK); flush_rewrite_rules(); }

    private static function local_allowed($url) {
        $parts = wp_parse_url($url);
        return defined('WP_DEBUG') && WP_DEBUG && defined('PEPTIDE_ATLAS_ALLOW_LOCAL') && PEPTIDE_ATLAS_ALLOW_LOCAL
            && isset($parts['host']) && in_array(strtolower($parts['host']), array('localhost','127.0.0.1','[::1]','::1'), true);
    }

    private static function valid_base($raw) {
        $url = untrailingslashit(trim((string)$raw));
        $parts = wp_parse_url($url);
        if (!$parts || empty($parts['host']) || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])) { return false; }
        if (($parts['scheme'] ?? '') !== 'https' && !(($parts['scheme'] ?? '') === 'http' && self::local_allowed($url))) { return false; }
        return esc_url_raw($url, array('https','http'));
    }

    private static function status($ok, $message) {
        $old = get_option(self::STATUS, array());
        update_option(self::STATUS, array('ok'=>$ok, 'message'=>$message, 'attemptAt'=>time(), 'lastSuccessAt'=>$ok ? time() : ($old['lastSuccessAt'] ?? null)), false);
    }

    private static function connection_fingerprint($settings) {
        return hash('sha256', (string)($settings['url']??'') . "\0" . (string)($settings['key']??''));
    }

    public static function sync() {
        $settings = get_option(self::SETTINGS, array());
        $base = self::valid_base($settings['url'] ?? '');
        if (!$base || empty($settings['key'])) { self::status(false, 'Add the central application URL and connection key.'); return false; }
        $fingerprint = self::connection_fingerprint($settings);
        $lock = (int)get_option(self::LOCK, 0);
        if ($lock && $lock < time()-120) { delete_option(self::LOCK); }
        if (!add_option(self::LOCK, time(), '', false)) { return false; }
        try {
            $host = wp_parse_url($base, PHP_URL_HOST);
            $port = (int)wp_parse_url($base, PHP_URL_PORT);
            $allow_local = self::local_allowed($base);
            $host_filter = function($external, $request_host) use ($host, $allow_local) { return $allow_local && $request_host === $host ? true : $external; };
            $port_filter = function($ports) use ($port, $allow_local) { if ($allow_local && $port) { $ports[] = $port; } return array_unique($ports); };
            if ($allow_local) { add_filter('http_request_host_is_external', $host_filter, 10, 2); add_filter('http_allowed_safe_ports', $port_filter); }
            try {
                $response = wp_safe_remote_get($base . '/api/v1/node/snapshot', array(
                    'timeout'=>15, 'redirection'=>0, 'limit_response_size'=>8*1024*1024,
                    'headers'=>array('Authorization'=>'Bearer ' . $settings['key'], 'Accept'=>'application/json', 'X-Atlas-Connector'=>'wordpress/' . self::VERSION),
                ));
            } finally {
                if ($allow_local) { remove_filter('http_request_host_is_external', $host_filter, 10); remove_filter('http_allowed_safe_ports', $port_filter); }
            }
            // Settings can change in another request while the HTTP call is pending.
            wp_cache_delete(self::SETTINGS, 'options');
            if (!hash_equals($fingerprint, self::connection_fingerprint(get_option(self::SETTINGS, array())))) { return false; }
            if (is_wp_error($response)) { self::status(false, 'Connection failed. The last valid snapshot remains available until its expiry.'); return false; }
            $code = wp_remote_retrieve_response_code($response);
            if ($code === 401 || $code === 403) { delete_option(self::SNAPSHOT); self::status(false, 'Connection access was rejected. Cached content has been removed. Check the node and connection key.'); return false; }
            if ($code !== 200) { self::status(false, 'Central application returned HTTP ' . (int)$code . '.'); return false; }
            $body = json_decode(wp_remote_retrieve_body($response), true);
            $snapshot = self::validate_snapshot($body);
            if (is_wp_error($snapshot)) { self::status(false, $snapshot->get_error_message()); return false; }
            $snapshot['connectionFingerprint']=$fingerprint;
            update_option(self::SNAPSHOT, $snapshot, false);
            self::status(true, 'Published knowledge synchronized successfully.');
            return true;
        } finally { delete_option(self::LOCK); }
    }

    public static function validate_snapshot($data) {
        if (!is_array($data) || ($data['schemaVersion'] ?? null) !== 1 || !isset($data['items'], $data['node'], $data['version'], $data['generatedAt']) || !is_array($data['items']) || !is_array($data['node']) || count($data['items']) > 10000) { return new WP_Error('atlas_schema', 'The application returned an unsupported snapshot. Existing content has not been replaced.'); }
        if (isset($data['node']['enabled']) && !$data['node']['enabled']) { delete_option(self::SNAPSHOT); return new WP_Error('atlas_disabled', 'This node is disabled. Cached content has been removed.'); }
        $generated = strtotime($data['generatedAt']);
        $ttl = min(self::MAX_AGE, max(0, (int)($data['maxAgeSeconds'] ?? self::MAX_AGE)));
        if (!$generated || $generated > time()+300 || $generated+$ttl <= time()) { return new WP_Error('atlas_expired', 'The application returned expired content.'); }
        $allowed = array_keys(self::categories());
        $scope = array_values(array_intersect($allowed, is_array($data['node']['categories'] ?? null) ? $data['node']['categories'] : array()));
        $items = array();
        foreach ($data['items'] as $item) {
            if (!is_array($item) || empty($item['id']) || !is_string($item['id']) || !is_string($item['slug'] ?? null) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $item['slug']) || !is_string($item['name'] ?? null) || !is_array($item['categories'] ?? null)) { return new WP_Error('atlas_item', 'The application returned an invalid content record. Existing content has not been replaced.'); }
            if (($item['publicationState'] ?? '') !== 'published') { continue; }
            $item['categories'] = array_values(array_intersect($allowed, $item['categories']));
            if ($scope && !array_intersect($scope, $item['categories'])) { continue; }
            $clean = array('id'=>$item['id'], 'slug'=>$item['slug'], 'name'=>$item['name'], 'categories'=>$item['categories']);
            foreach (array('summary','description','mechanism','evidenceLevel','regulatoryStatus','jurisdiction','reviewer','reviewStatus','updatedAt','molecularClass','keyTakeaway','catalogRelease') as $field) { $clean[$field] = is_string($item[$field] ?? null) ? $item[$field] : ''; }
            $clean['displayStatus'] = in_array($item['displayStatus'] ?? '',array('fda_approved','clinical_trial','not_fda_approved','cosmetic'),true)?$item['displayStatus']:'';
            $clean['displayStatusNote'] = is_string($item['displayStatusNote'] ?? null)?sanitize_textarea_field($item['displayStatusNote']):'';
            $clean['reviewedAt'] = is_string($item['reviewedAt'] ?? null) ? $item['reviewedAt'] : null;
            $clean['aliases'] = array_values(array_filter(is_array($item['aliases'] ?? null) ? $item['aliases'] : array(), 'is_string'));
            $clean['references'] = array(); $reference_map=array();
            foreach (array_values(is_array($item['references'] ?? null) ? $item['references'] : array()) as $ref_index=>$ref) {
                if (is_array($ref) && is_string($ref['title'] ?? null) && is_string($ref['url'] ?? null) && in_array(wp_parse_url($ref['url'], PHP_URL_SCHEME), array('https','http'), true) && !wp_parse_url($ref['url'], PHP_URL_USER) && !wp_parse_url($ref['url'], PHP_URL_PASS)) {
                    $clean['references'][] = array('title'=>$ref['title'], 'url'=>esc_url_raw($ref['url'], array('https','http')), 'kind'=>is_string($ref['kind'] ?? null)?$ref['kind']:'', 'accessedAt'=>is_string($ref['accessedAt'] ?? null)?$ref['accessedAt']:'');
                    $reference_map[$ref_index+1]=count($clean['references']);
                }
            }
            $clean['atAGlance']=array();
            foreach (array_slice(is_array($item['atAGlance'] ?? null)?$item['atAGlance']:array(),0,20) as $row) { if(is_array($row)&&is_string($row['label']??null)&&is_string($row['value']??null))$clean['atAGlance'][]=array('label'=>$row['label'],'value'=>$row['value']); }
            $clean['sections']=array();
            foreach (array_slice(is_array($item['sections'] ?? null)?$item['sections']:array(),0,30) as $section) {
                if(!is_array($section)||!is_string($section['id']??null)||!preg_match('/^[a-z0-9][a-z0-9-]*$/',$section['id'])||!is_string($section['title']??null)||!is_string($section['body']??null))continue;
                $citations=array();foreach(is_array($section['citations']??null)?$section['citations']:array() as $number){if(is_int($number)&&isset($reference_map[$number]))$citations[]=$reference_map[$number];}
                $clean['sections'][]=array('id'=>$section['id'],'title'=>$section['title'],'body'=>$section['body'],'citations'=>array_values(array_unique($citations)));
            }
            $clean['referenceNames']=array_slice(array_values(array_filter(is_array($item['referenceNames']??null)?$item['referenceNames']:array(),'is_string')),0,20);
            $clean['relatedSlugs']=array_values(array_filter(array_slice(is_array($item['relatedSlugs']??null)?$item['relatedSlugs']:array(),0,12),function($slug){return is_string($slug)&&preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/',$slug);}));
            $clean['revision'] = (int)($item['revision'] ?? 0);
            $clean['publicationState'] = 'published';
            $items[] = $clean;
        }
        return array('schemaVersion'=>1, 'version'=>sanitize_text_field($data['version']), 'node'=>array('id'=>sanitize_text_field($data['node']['id'] ?? ''), 'name'=>sanitize_text_field($data['node']['name'] ?? ''), 'categories'=>$scope), 'items'=>$items, 'fetchedAt'=>time(), 'expiresAt'=>min(time()+$ttl, $generated+$ttl), 'generatedAt'=>gmdate('c', $generated), 'viewerVersion'=>sanitize_text_field($data['viewerVersion'] ?? '1.0.0'));
    }

    public static function snapshot() {
        $snapshot = get_option(self::SNAPSHOT, null);
        if (!$snapshot || (int)($snapshot['expiresAt'] ?? 0) <= time()) { return null; }
        $settings=get_option(self::SETTINGS, array());
        if(empty($settings['url'])||empty($settings['key'])||!is_string($snapshot['connectionFingerprint']??null)||!hash_equals(self::connection_fingerprint($settings),$snapshot['connectionFingerprint'])) { return null; }
        return $snapshot;
    }

    public static function menu() { add_options_page('Peptide Atlas', 'Peptide Atlas', 'manage_options', 'peptide-atlas', array(__CLASS__, 'settings_page')); }
    private static function authorize($action) { if (!current_user_can('manage_options')) { wp_die('Administrator access is required.', '', array('response'=>403)); } check_admin_referer($action); }
    private static function redirect() { wp_safe_redirect(admin_url('options-general.php?page=peptide-atlas')); exit; }

    public static function save() {
        self::authorize('peptide_atlas_save');
        $previous = get_option(self::SETTINGS, array());
        $url = self::valid_base(wp_unslash($_POST['atlas_url'] ?? ''));
        if (!$url) { self::status(false, 'Enter an HTTPS application URL without a query, fragment, or login credentials.'); self::redirect(); }
        $key_input = trim((string)wp_unslash($_POST['atlas_key'] ?? ''));
        $key = $key_input === '' ? ($previous['key'] ?? '') : $key_input;
        if (!$key || strlen($key) > 512 || preg_match('/[\x00-\x20\x7f]/', $key)) { self::status(false, 'Enter a valid node connection key.'); self::redirect(); }
        $font = sanitize_text_field(wp_unslash($_POST['atlas_font'] ?? 'inherit'));
        if (!in_array($font, array('inherit','system','serif'), true)) { $font='inherit'; }
        $settings = array('url'=>$url, 'key'=>$key, 'accent'=>sanitize_hex_color(wp_unslash($_POST['atlas_accent'] ?? '')) ?: '#147d72', 'background'=>sanitize_hex_color(wp_unslash($_POST['atlas_background'] ?? '')) ?: '#f5f8f6', 'font'=>$font, 'title'=>sanitize_text_field(wp_unslash($_POST['atlas_title'] ?? 'Explore the peptide library')));
        if (($previous['url'] ?? '') !== $url || ($previous['key'] ?? '') !== $key) { delete_option(self::SNAPSHOT); }
        update_option(self::SETTINGS, $settings, false);
        if (!wp_next_scheduled(self::CRON)) { wp_schedule_event(time()+30, 'peptide_atlas_15m', self::CRON); }
        self::sync(); self::redirect();
    }

    public static function manual_sync() { self::authorize('peptide_atlas_sync'); self::sync(); self::redirect(); }
    public static function disconnect() { self::authorize('peptide_atlas_disconnect'); delete_option(self::SETTINGS); delete_option(self::SNAPSHOT); delete_option(self::STATUS); wp_clear_scheduled_hook(self::CRON); self::redirect(); }

    public static function settings_page() {
        if (!current_user_can('manage_options')) { return; }
        $s = get_option(self::SETTINGS, array()); $status = get_option(self::STATUS, array()); $snap = self::snapshot();
        ?>
        <div class="wrap"><h1>Peptide Atlas</h1><p>One shared knowledge base. Your website's design. Add <code>[peptide_atlas]</code> to a page after connecting.</p>
        <?php if (!empty($status['message'])): ?><div class="notice <?php echo !empty($status['ok']) ? 'notice-success' : 'notice-warning'; ?>"><p><?php echo esc_html($status['message']); ?></p></div><?php endif; ?>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="peptide_atlas_save"><?php wp_nonce_field('peptide_atlas_save'); ?>
        <table class="form-table" role="presentation">
        <tr><th><label for="atlas_url">Central application URL</label></th><td><input class="regular-text" id="atlas_url" name="atlas_url" type="url" required value="<?php echo esc_attr($s['url'] ?? ''); ?>" placeholder="https://knowledge.example.com"></td></tr>
        <tr><th><label for="atlas_key">Node connection key</label></th><td><input class="regular-text" id="atlas_key" name="atlas_key" type="password" autocomplete="new-password" value="" placeholder="<?php echo !empty($s['key']) ? 'Stored — leave blank to keep it' : 'Paste the key shown when creating the node'; ?>"><p class="description">Kept on your server. It is never sent to visitors' browsers.</p></td></tr>
        <tr><th><label for="atlas_title">Library heading</label></th><td><input class="regular-text" id="atlas_title" name="atlas_title" value="<?php echo esc_attr($s['title'] ?? 'Explore the peptide library'); ?>"></td></tr>
        <tr><th><label for="atlas_accent">Accent colour</label></th><td><input id="atlas_accent" name="atlas_accent" type="color" value="<?php echo esc_attr($s['accent'] ?? '#147d72'); ?>"></td></tr>
        <tr><th><label for="atlas_background">Background colour</label></th><td><input id="atlas_background" name="atlas_background" type="color" value="<?php echo esc_attr($s['background'] ?? '#f5f8f6'); ?>"></td></tr>
        <tr><th><label for="atlas_font">Interface font</label></th><td><select id="atlas_font" name="atlas_font"><?php foreach (array('inherit'=>'Use website font','system'=>'System sans-serif','serif'=>'Serif') as $value=>$label): ?><option value="<?php echo esc_attr($value); ?>" <?php selected($s['font'] ?? 'inherit', $value); ?>><?php echo esc_html($label); ?></option><?php endforeach; ?></select></td></tr>
        </table><?php submit_button('Save and synchronize'); ?></form>
        <h2>Connection status</h2><p><?php echo $snap ? esc_html(count($snap['items']) . ' published entries • last synchronized ' . wp_date('M j, Y H:i', $snap['fetchedAt'])) : 'No current snapshot. Connect and synchronize to show the library.'; ?></p>
        <?php if ($snap): ?><p>Snapshot expires: <?php echo esc_html(wp_date('M j, Y H:i', $snap['expiresAt'])); ?>. Node: <?php echo esc_html($snap['node']['name']); ?>.</p><?php endif; ?>
        <p>Automatic refresh is scheduled every 15 minutes. WordPress must receive traffic or use a system cron for scheduled tasks to run. Exclude explorer and profile pages from full-page/CDN caches so withdrawals and expiry take effect.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="peptide_atlas_sync"><?php wp_nonce_field('peptide_atlas_sync'); submit_button('Synchronize now', 'secondary'); ?></form>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="peptide_atlas_disconnect"><?php wp_nonce_field('peptide_atlas_disconnect'); submit_button('Disconnect and clear local content', 'secondary'); ?></form></div>
        <?php
    }

    private static function assets() {
        wp_enqueue_style('peptide-atlas', plugins_url('assets/explorer.css', __FILE__), array(), self::VERSION);
        wp_enqueue_script('peptide-atlas-profile', plugins_url('assets/profile.js', __FILE__), array(), self::VERSION, true);
        wp_enqueue_script('peptide-atlas-viewer', plugins_url('assets/viewer.js', __FILE__), array(), self::VERSION, true);
        wp_enqueue_script('peptide-atlas-explorer', plugins_url('assets/explorer.js', __FILE__), array('peptide-atlas-viewer'), self::VERSION, true);
    }

    private static function no_page_cache() {
        if (!defined('DONOTCACHEPAGE')) { define('DONOTCACHEPAGE', true); }
        if (!headers_sent()) { nocache_headers(); }
    }

    public static function display_status($item) {
        return in_array($item['displayStatus'] ?? '', array('fda_approved','clinical_trial','not_fda_approved','cosmetic'), true) ? $item['displayStatus'] : 'unreviewed';
    }

    public static function display_status_label($item) {
        $labels=array('fda_approved'=>'FDA approved','clinical_trial'=>'In clinical trials','not_fda_approved'=>'Not FDA approved','cosmetic'=>'Cosmetic / topical','unreviewed'=>'Status needs review');
        return $labels[self::display_status($item)];
    }

    public static function profile_url($slug) {
        return get_option('permalink_structure') ? home_url('/atlas-peptides/' . rawurlencode($slug) . '/') : add_query_arg('atlas_peptide', $slug, home_url('/'));
    }

    private static function theme_style() {
        $s=get_option(self::SETTINGS,array());
        $fonts=array('inherit'=>'inherit','system'=>'system-ui, sans-serif','serif'=>'Georgia, serif');
        return '--pa-accent:' . (sanitize_hex_color($s['accent'] ?? '') ?: '#147d72') . ';--pa-bg:' . (sanitize_hex_color($s['background'] ?? '') ?: '#f5f8f6') . ';--pa-font:' . ($fonts[$s['font'] ?? 'inherit'] ?? 'inherit') . ';';
    }

    public static function shortcode($attributes=array()) {
        self::assets(); self::no_page_cache();
        $snapshot=self::snapshot();
        if (!$snapshot) { return '<section class="pa-explorer pa-unavailable" role="status"><h2>Knowledge library</h2><p>The library is temporarily unavailable. Please check back shortly.</p></section>'; }
        $s=get_option(self::SETTINGS,array());
        $items=$snapshot['items'];
        foreach ($items as &$item) { $item['profileUrl']=self::profile_url($item['slug']); } unset($item);
        $public=array('items'=>$items,'categories'=>self::categories(),'version'=>$snapshot['version'],'generatedAt'=>$snapshot['generatedAt']);
        $id=wp_unique_id('pa-explorer-');
        ob_start(); ?>
        <section class="pa-explorer" id="<?php echo esc_attr($id); ?>" style="<?php echo esc_attr(self::theme_style()); ?>">
        <header class="pa-header"><span class="pa-eyebrow">THE PEPTIDE LIBRARY</span><h2><?php echo esc_html($s['title'] ?? 'Explore the peptide library'); ?></h2><p>Follow your curiosity. Explore research by body system and read the source material.</p></header>
        <div class="pa-layout"><aside class="pa-controls"><label class="pa-search-label">Search the library<input class="pa-search" type="search" placeholder="Name or research area" autocomplete="off"></label><div class="pa-categories" aria-label="Body systems"></div><p class="pa-caption">Choose a system on the body or browse the categories.</p></aside><div class="pa-human" aria-label="Interactive body navigation"></div><div class="pa-results"><div class="pa-results-heading"><h3>All entries</h3><span class="pa-count"><?php echo count($items); ?></span></div><div class="pa-cards"><?php foreach ($items as $item): ?><article class="pa-card pa-display-<?php echo esc_attr(self::display_status($item)); ?>"><div class="pa-card-meta"><span class="pa-status-pill" title="<?php echo esc_attr($item['displayStatusNote']??''); ?>"><?php echo esc_html(self::display_status_label($item)); ?></span></div><span class="pa-evidence"><?php echo esc_html(ucfirst($item['evidenceLevel'])); ?> evidence</span><h4><a href="<?php echo esc_url($item['profileUrl']); ?>"><?php echo esc_html($item['name']); ?></a></h4><p><?php echo esc_html($item['summary']); ?></p></article><?php endforeach; ?></div><p class="pa-empty" hidden>No entries match this search. Try another name or category.</p></div></div>
        <footer class="pa-footer">Educational reference. Research findings and approval status are distinct. Read the sources and review details in each profile.</footer>
        <script type="application/json" class="pa-catalog"><?php echo wp_json_encode($public, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script></section>
        <?php return ob_get_clean();
    }

    public static function profile_route() {
        $slug=get_query_var('atlas_peptide');
        if (!$slug) {
            if (is_singular()) { $post=get_post(); if ($post && has_shortcode($post->post_content, 'peptide_atlas')) { self::no_page_cache(); } }
            return;
        }
        self::no_page_cache();
        $snapshot=self::snapshot(); $entry=null;
        foreach (($snapshot['items'] ?? array()) as $item) { if ($item['slug'] === $slug) { $entry=$item; break; } }
        if (!$entry && $snapshot) { foreach ($snapshot['items'] as $candidate) { foreach (($candidate['referenceNames']??array()) as $alias) { if(sanitize_title($alias)===$slug) { wp_safe_redirect(self::profile_url($candidate['slug']),301); exit; } } } }
        if (!$entry) { status_header($snapshot ? 404 : 503); get_header(); echo '<main class="pa-explorer pa-unavailable"><h1>' . ($snapshot ? 'Entry unavailable' : 'Library temporarily unavailable') . '</h1><p>This entry is unavailable on this website.</p></main>'; get_footer(); exit; }
        $entry += array('molecularClass'=>'','keyTakeaway'=>'','atAGlance'=>array(),'sections'=>array(),'relatedSlugs'=>array());
        $status_labels=array('approved_medicine'=>'Approved medicine','clinical_trials'=>'Investigational','research_only'=>'Research / unapproved','cosmetic'=>'Cosmetic / topical','unspecified'=>'Context-dependent status');
        status_header(200); self::assets();
        add_filter('document_title_parts', function($parts) use ($entry) { $parts['title']=$entry['name'] . ' | Peptide library'; return $parts; });
        remove_action('wp_head', 'rel_canonical');
        add_action('wp_head', function() use ($entry) { echo '<link rel="canonical" href="' . esc_url(self::profile_url($entry['slug'])) . '">'; echo '<meta name="description" content="' . esc_attr($entry['summary']) . '">'; });
        add_action('wp_head', function() use ($entry) { $schema=array('@context'=>'https://schema.org','@type'=>'MedicalWebPage','name'=>$entry['name'],'description'=>$entry['summary'],'url'=>self::profile_url($entry['slug']),'dateModified'=>$entry['updatedAt'],'mainEntity'=>array('@type'=>'Article','headline'=>$entry['name'],'author'=>array('@type'=>'Organization','name'=>get_bloginfo('name')),'citation'=>array_map(function($r){return $r['url'];},$entry['references'])));echo '<script type="application/ld+json">'.wp_json_encode($schema,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).'</script>'; });
        get_header(); ?>
        <main class="pa-explorer pa-profile" style="<?php echo esc_attr(self::theme_style()); ?>"><span class="pa-eyebrow">PEPTIDE KNOWLEDGE</span><h1><?php echo esc_html($entry['name']); ?></h1>
        <?php if ($entry['aliases']): ?><p class="pa-caption">Also known as <?php echo esc_html(implode(', ', $entry['aliases'])); ?></p><?php endif; ?>
        <p class="pa-lead"><?php echo esc_html($entry['summary']); ?></p><div class="pa-profile-meta"><span><?php echo esc_html(ucfirst($entry['evidenceLevel'])); ?> evidence</span><span><?php echo esc_html(self::display_status_label($entry)); ?></span><span><?php echo esc_html($entry['jurisdiction']); ?></span></div>
        <?php if(!empty($entry['displayStatusNote'])): ?><p class="pa-status-note"><?php echo esc_html($entry['displayStatusNote']); ?></p><?php endif; ?>
        <?php if ($entry['reviewStatus'] === 'source_checked'): ?><p class="pa-caption">AI-assisted source review • <?php echo esc_html($entry['reviewedAt']); ?>. See the original sources below.</p><?php elseif ($entry['reviewStatus'] !== 'reviewed'): ?><p class="pa-review-note">This profile is awaiting editorial review.</p><?php elseif ($entry['reviewer']): ?><p class="pa-caption">Reviewed by <?php echo esc_html($entry['reviewer']); ?><?php if ($entry['reviewedAt']) { echo ' • ' . esc_html($entry['reviewedAt']); } ?></p><?php endif; ?>
        <div class="pa-article-tabs" role="tablist" aria-label="Article view"><button type="button" role="tab" id="guide-tab" aria-controls="guide-panel" aria-selected="true" data-tab="guide">Guide</button><button type="button" role="tab" id="sources-tab" aria-controls="sources-panel" aria-selected="false" data-tab="sources">Sources (<?php echo count($entry['references']); ?>)</button></div>
        <nav class="pa-article-toc" aria-label="On this page"><a href="#overview">Overview</a><?php foreach($entry['sections'] as $section): ?><a href="#<?php echo esc_attr($section['id']); ?>"><?php echo esc_html($section['title']); ?></a><?php endforeach; ?><a href="#sources">Sources</a></nav>
        <div id="guide-panel" role="tabpanel" aria-labelledby="guide-tab">
        <?php if ($entry['keyTakeaway']): ?><aside class="pa-takeaway"><span class="pa-eyebrow">KEY TAKEAWAY</span><?php echo wpautop(esc_html($entry['keyTakeaway'])); ?></aside><?php endif; ?>
        <?php if ($entry['atAGlance']): ?><section><h2>At a glance</h2><table class="pa-glance"><tbody><?php foreach($entry['atAGlance'] as $row): ?><tr><th scope="row"><?php echo esc_html($row['label']); ?></th><td><?php echo esc_html($row['value']); ?></td></tr><?php endforeach; ?></tbody></table></section><?php endif; ?>
        <section id="overview"><h2>Overview</h2><?php echo wpautop(esc_html($entry['description'])); ?></section>
        <?php if ($entry['mechanism']): ?><section id="mechanism"><h2>How it works</h2><?php echo wpautop(esc_html($entry['mechanism'])); ?></section><?php endif; ?>
        <?php foreach($entry['sections'] as $section): ?><section id="<?php echo esc_attr($section['id']); ?>"><h2><?php echo esc_html($section['title']); ?></h2><?php echo wpautop(esc_html($section['body'])); ?><?php if($section['citations']): ?><p class="pa-citations">Supporting sources <?php foreach($section['citations'] as $number): ?><a href="#ref-<?php echo (int)$number; ?>">[<?php echo (int)$number; ?>]</a> <?php endforeach; ?></p><?php endif; ?></section><?php endforeach; ?>
        <?php if($entry['molecularClass']): ?><p class="pa-caption">Molecular class: <?php echo esc_html($entry['molecularClass']); ?>.</p><?php endif; ?>
        <?php if($entry['reviewStatus']==='source_checked'): ?><p class="pa-caption">This is AI-assisted source synthesis. It is not represented as clinician review. Approval concerns the specified product, use and jurisdiction.</p><?php endif; ?></div>
        <section id="sources-panel" role="tabpanel" aria-labelledby="sources-tab"><h2 id="sources">Sources & references</h2><ol class="pa-references"><?php foreach ($entry['references'] as $index=>$ref): ?><li id="ref-<?php echo (int)$index+1; ?>"><a href="<?php echo esc_url($ref['url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($ref['title']); ?></a><?php if(!empty($ref['accessedAt'])): ?><small>Checked <?php echo esc_html($ref['accessedAt']); ?></small><?php endif; ?></li><?php endforeach; ?></ol></section>
        <?php $related=array_values(array_filter($snapshot['items'],function($p)use($entry){return in_array($p['slug'],$entry['relatedSlugs'],true);})); if($related): ?><section><h2>Related profiles</h2><div class="pa-related"><?php foreach(array_slice($related,0,6) as $p): ?><a href="<?php echo esc_url(self::profile_url($p['slug'])); ?>"><?php echo esc_html($p['name']); ?> ↗</a><?php endforeach; ?></div></section><?php endif; ?>
        <footer class="pa-footer">Educational reference. Revision <?php echo (int)$entry['revision']; ?>. Last updated <?php echo esc_html(substr($entry['updatedAt'], 0, 10)); ?>.</footer></main>
        <?php get_footer(); exit;
    }
}

Peptide_Atlas_Connector::boot();
register_activation_hook(__FILE__, array('Peptide_Atlas_Connector','activate'));
register_deactivation_hook(__FILE__, array('Peptide_Atlas_Connector','deactivate'));
