/** Optional real-WordPress integration test. Install @wp-playground/cli separately.
 * ATLAS_PLAYGROUND_MODULE may point to its absolute index.js to keep QA dependencies outside this project.
 * Uses disposable WordPress + PHP/WASM and a mocked central HTTP service, never a real user site.
 */
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
const { runCLI } = await import(process.env.ATLAS_PLAYGROUND_MODULE || '@wp-playground/cli');
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = await runCLI({
  command: 'server', wp: process.env.ATLAS_QA_WP_VERSION || '6.8', php: '8.3', port: 9487, workers: 1, verbosity: 'quiet',
  mount: [{ hostPath: resolve(project, 'wordpress/peptide-atlas-connector'), vfsPath: '/wordpress/wp-content/plugins/peptide-atlas-connector' }],
  blueprint: { steps: [
    { step: 'activatePlugin', pluginPath: 'peptide-atlas-connector/peptide-atlas-connector.php' },
    { step: 'setSiteOptions', options: { blogname: 'Peptide Atlas Connector QA', permalink_structure: '/%postname%/' } }
  ] }
});
const report = { runtime: {}, checks: [] };
const checks = report.checks;
async function php(code) {
  const result = await cli.playground.run({ code: "<?php require_once '/wordpress/wp-load.php'; " + code });
  if (result.errors) throw new Error(result.errors);
  return result;
}
try {
  const first = await php(`
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/template.php';
    $admin = get_user_by('login', 'admin'); wp_set_current_user($admin->ID);
    $checks = array();
    function atlas_qa_assert($ok, $label) { global $checks; if (!$ok) { throw new RuntimeException($label); } $checks[]=$label; }
    atlas_qa_assert(is_plugin_active('peptide-atlas-connector/peptide-atlas-connector.php'), 'Plugin activates in real WordPress');
    atlas_qa_assert(shortcode_exists('peptide_atlas'), 'Explorer shortcode is registered');
    atlas_qa_assert((bool)wp_next_scheduled(Peptide_Atlas_Connector::CRON), 'Refresh event is scheduled');
    $record = array('id'=>'entry-1','slug'=>'qa-entry','name'=>'QA peptide <script>alert(1)</script>','categories'=>array('skin'),'publicationState'=>'published','summary'=>'A test-only reference record.','description'=>'This fixture exercises rendering.','mechanism'=>'No scientific claim.','evidenceLevel'=>'limited','regulatoryStatus'=>'approved_medicine','displayStatus'=>'not_fda_approved','displayStatusNote'=>'Test fixture approval outside the United States.','jurisdiction'=>'','references'=>array(array('title'=>'QA source','url'=>'https://example.org/source'),array('title'=>'Unsafe source','url'=>'javascript:alert(1)'),array('title'=>'Specific primary source','url'=>'https://example.org/second','kind'=>'primary_research','accessedAt'=>'2026-10-27')),'molecularClass'=>'QA molecular class','keyTakeaway'=>'A complete article takeaway.','atAGlance'=>array(array('label'=>'Scope','value'=>'Test fixture only')),'sections'=>array(array('id'=>'qa-safety','title'=>'QA safety context','body'=>'Detailed article body <script>alert(2)</script>','citations'=>array(1,2,3))),'referenceNames'=>array('QA alias'),'relatedSlugs'=>array(),'reviewer'=>'Peptide Atlas — AI source review','reviewedAt'=>'2026-10-27','reviewStatus'=>'source_checked','revision'=>1,'updatedAt'=>gmdate('c'));
    $draft=$record; $draft['id']='draft'; $draft['slug']='draft'; $draft['publicationState']='draft';
    $outside=$record; $outside['id']='outside'; $outside['slug']='outside'; $outside['categories']=array('brain');
    $snapshot = array('schemaVersion'=>1,'version'=>'qa-v1','generatedAt'=>gmdate('c'),'maxAgeSeconds'=>3600,'viewerVersion'=>'1.0.0','node'=>array('id'=>'node-qa','name'=>'QA website','categories'=>array('skin')),'items'=>array($record,$draft,$outside));
    $GLOBALS['atlas_qa_snapshot']=$snapshot;
    $GLOBALS['atlas_qa_mode']='success';
    $GLOBALS['atlas_qa_headers']=false;
    add_filter('pre_http_request', function($pre, $args, $url) {
      if ($url !== 'https://central.example.org/api/v1/node/snapshot') { return $pre; }
      $GLOBALS['atlas_qa_headers'] = ($args['headers']['Authorization'] ?? '') === 'Bearer qa-not-a-real-secret' && ($args['redirection'] ?? 1) === 0;
      if ($GLOBALS['atlas_qa_mode'] === 'disconnect') { delete_option(Peptide_Atlas_Connector::SETTINGS); delete_option(Peptide_Atlas_Connector::SNAPSHOT); }
      if ($GLOBALS['atlas_qa_mode'] === 'rotate') { $changed=get_option(Peptide_Atlas_Connector::SETTINGS); $changed['key']='replacement-test-key'; update_option(Peptide_Atlas_Connector::SETTINGS,$changed,false); }
      if ($GLOBALS['atlas_qa_mode'] === 'network') { return new WP_Error('qa_network','Simulated network outage'); }
      if ($GLOBALS['atlas_qa_mode'] === 'revoked') { return array('headers'=>array(),'body'=>'{}','response'=>array('code'=>403,'message'=>'Forbidden'),'cookies'=>array()); }
      return array('headers'=>array(),'body'=>wp_json_encode($GLOBALS['atlas_qa_snapshot']),'response'=>array('code'=>200,'message'=>'OK'),'cookies'=>array());
    }, 10, 3);
    update_option(Peptide_Atlas_Connector::SETTINGS, array('url'=>'https://central.example.org','key'=>'qa-not-a-real-secret','title'=>'QA library','accent'=>'#123456','background'=>'#ffffff','font'=>'serif'), false);
    atlas_qa_assert(Peptide_Atlas_Connector::sync(), 'Published snapshot synchronizes through WordPress HTTP API');
    atlas_qa_assert($GLOBALS['atlas_qa_headers'], 'Authorization stays server-side and redirects are disabled');
    $stored=Peptide_Atlas_Connector::snapshot();
    atlas_qa_assert(count($stored['items']) === 1 && $stored['items'][0]['id'] === 'entry-1', 'Draft and out-of-scope records are excluded');
    atlas_qa_assert(count($stored['items'][0]['references']) === 2 && $stored['items'][0]['sections'][0]['citations'] === array(1,2), 'Rich sections keep citation numbers aligned after unsafe links are removed');
    atlas_qa_assert($stored['items'][0]['keyTakeaway'] === 'A complete article takeaway.' && $stored['items'][0]['referenceNames'] === array('QA alias'), 'Structured article facts and canonical reference names survive synchronization');
    atlas_qa_assert($stored['items'][0]['displayStatus'] === 'not_fda_approved' && $stored['items'][0]['displayStatusNote'] === 'Test fixture approval outside the United States.', 'Explicit FDA status and jurisdiction qualification survive synchronization');
    atlas_qa_assert(Peptide_Atlas_Connector::display_status_label(array('regulatoryStatus'=>'approved_medicine')) === 'Status needs review' && Peptide_Atlas_Connector::display_status_label(array('displayStatus'=>'fda_approved unknown')) === 'Status needs review', 'Legacy and unknown statuses never become implied FDA approvals');
    $html=do_shortcode('[peptide_atlas]');
    atlas_qa_assert(strpos($html,'pa-display-not_fda_approved') !== false && strpos($html,'Not FDA approved') !== false, 'WordPress server-rendered cards preserve the explicit status colour and label');
    atlas_qa_assert(strpos($html, 'QA library') !== false && strpos($html, 'qa-entry') !== false, 'Explorer shortcode renders a published entry');
    atlas_qa_assert(strpos($html, 'qa-not-a-real-secret') === false && strpos($html, '<script>alert(1)</script>') === false, 'Browser markup contains no credential or unescaped content');
    ob_start(); Peptide_Atlas_Connector::settings_page(); $settings=ob_get_clean();
    atlas_qa_assert(strpos($settings,'Save and synchronize') !== false && strpos($settings,'qa-not-a-real-secret') === false, 'Admin settings render and keep the stored credential masked');
    $GLOBALS['atlas_qa_mode']='network';
    atlas_qa_assert(!Peptide_Atlas_Connector::sync() && Peptide_Atlas_Connector::snapshot() !== null, 'Temporary network failure preserves valid delivery content');
    $GLOBALS['atlas_qa_mode']='success'; $GLOBALS['atlas_qa_snapshot']['items']=array();
    atlas_qa_assert(Peptide_Atlas_Connector::sync() && count(Peptide_Atlas_Connector::snapshot()['items']) === 0, 'Withdrawn records are removed on synchronization');
    $GLOBALS['atlas_qa_snapshot']=$snapshot; Peptide_Atlas_Connector::sync();
    $expired=get_option(Peptide_Atlas_Connector::SNAPSHOT); $expired['expiresAt']=time()-1; update_option(Peptide_Atlas_Connector::SNAPSHOT,$expired,false);
    atlas_qa_assert(Peptide_Atlas_Connector::snapshot() === null, 'Expired snapshot is not served');
    Peptide_Atlas_Connector::sync(); $GLOBALS['atlas_qa_mode']='revoked';
    atlas_qa_assert(!Peptide_Atlas_Connector::sync() && get_option(Peptide_Atlas_Connector::SNAPSHOT,null) === null, 'Revoked access clears the durable snapshot');
    $GLOBALS['atlas_qa_mode']='success'; Peptide_Atlas_Connector::sync();
    $original_settings=get_option(Peptide_Atlas_Connector::SETTINGS);
    $GLOBALS['atlas_qa_mode']='disconnect';
    atlas_qa_assert(!Peptide_Atlas_Connector::sync() && get_option(Peptide_Atlas_Connector::SNAPSHOT,null) === null, 'Disconnect during an HTTP request cannot repopulate cleared content');
    update_option(Peptide_Atlas_Connector::SETTINGS,$original_settings,false); $GLOBALS['atlas_qa_mode']='success'; Peptide_Atlas_Connector::sync();
    $GLOBALS['atlas_qa_mode']='rotate';
    atlas_qa_assert(!Peptide_Atlas_Connector::sync() && Peptide_Atlas_Connector::snapshot() === null, 'Changed credentials reject an in-flight old snapshot and its previous cache');
    update_option(Peptide_Atlas_Connector::SETTINGS,$original_settings,false); $GLOBALS['atlas_qa_mode']='success'; Peptide_Atlas_Connector::sync();
    $malformed=Peptide_Atlas_Connector::validate_snapshot(array('schemaVersion'=>99));
    atlas_qa_assert(is_wp_error($malformed), 'Unsupported snapshot schema is rejected');
    update_option('atlas_qa_fixture_snapshot',$snapshot,false);
    $page_id=wp_insert_post(array('post_type'=>'page','post_title'=>'QA Explorer','post_name'=>'qa-explorer','post_content'=>'[peptide_atlas]','post_status'=>'publish'));
    Peptide_Atlas_Connector::routes(); flush_rewrite_rules();
    echo wp_json_encode(array('runtime'=>array('php'=>PHP_VERSION,'wordpress'=>$GLOBALS['wp_version']),'checks'=>$checks,'pageId'=>$page_id));
  `);
  const data = JSON.parse(first.text); report.runtime = data.runtime; checks.push(...data.checks);
  const profile = await cli.playground.request({ url: '/atlas-peptides/qa-entry/' });
  assert.equal(profile.httpStatusCode, 200);
  assert.match(profile.text, /This fixture exercises rendering/);
  assert.match(profile.text, /Sources &amp; references|Sources & references/);
  assert.ok(!profile.text.includes('qa-not-a-real-secret'));
  checks.push('Local profile URL serves complete HTML with sources');
  assert.match(profile.text, /A complete article takeaway/); assert.match(profile.text, /QA safety context/); assert.match(profile.text, /id="ref-2"/);
  assert.match(profile.text, /AI-assisted source review/); assert.match(profile.text, /MedicalWebPage/); assert.ok(!profile.text.includes('<script>alert(2)</script>'));
  checks.push('Full articles render key facts, section citations, provenance and structured data with escaped content');
  const alias=await cli.playground.request({url:'/atlas-peptides/qa-alias/'}); assert.equal(alias.httpStatusCode,301);
  checks.push('Alternate reference names redirect to the canonical local profile');
  const page = await cli.playground.request({ url: '/qa-explorer/' });
  assert.equal(page.httpStatusCode, 200); assert.match(page.text, /pa-explorer/);
  checks.push('Published WordPress page renders the explorer shortcode');

  // Exercise the genuine save action with a WordPress administrator and valid nonce.
  await php(`
    $admin=get_user_by('login','admin'); wp_set_current_user($admin->ID);
    add_filter('pre_http_request', function($pre,$args,$url) { if (strpos($url,'https://central.example.org/')!==0) return $pre; return array('headers'=>array(),'body'=>wp_json_encode(get_option('atlas_qa_fixture_snapshot')),'response'=>array('code'=>200,'message'=>'OK'),'cookies'=>array()); },10,3);
    $_POST=array('_wpnonce'=>wp_create_nonce('peptide_atlas_save'),'atlas_url'=>'https://central.example.org','atlas_key'=>'','atlas_title'=>'Saved via authenticated action','atlas_accent'=>'#654321','atlas_background'=>'#eeeeee','atlas_font'=>'system');
    $_REQUEST=$_POST;
    Peptide_Atlas_Connector::save();
  `);
  const afterSave = await php(`$s=get_option(Peptide_Atlas_Connector::SETTINGS); echo wp_json_encode(array('title'=>$s['title'],'retainedKey'=>$s['key']==='qa-not-a-real-secret','colour'=>$s['accent']));`);
  const saved = JSON.parse(afterSave.text);
  assert.equal(saved.title, 'Saved via authenticated action'); assert.equal(saved.retainedKey, true); assert.equal(saved.colour, '#654321');
  checks.push('Authenticated settings save preserves a masked key and applies local branding');

  const denied = await php(`wp_set_current_user(0); $_POST=array(); $_REQUEST=array(); Peptide_Atlas_Connector::manual_sync();`);
  assert.equal(denied.httpStatusCode, 403); checks.push('Anonymous administrative synchronization is denied');
  const nonceDenied = await php(`$admin=get_user_by('login','admin'); wp_set_current_user($admin->ID); $_POST=array('_wpnonce'=>'invalid'); $_REQUEST=$_POST; Peptide_Atlas_Connector::manual_sync();`);
  assert.equal(nonceDenied.httpStatusCode, 403); checks.push('Administrative synchronization without a valid nonce is denied');

  const asset = await cli.playground.request({ url: '/wp-content/plugins/peptide-atlas-connector/assets/viewer.js' });
  assert.equal(asset.httpStatusCode, 200); assert.ok(asset.text.includes('PeptideAtlasViewer'));
  checks.push('Shared human viewer bundle is served by WordPress');
  const articleScript=await cli.playground.request({url:'/wp-content/plugins/peptide-atlas-connector/assets/profile.js'});
  assert.equal(articleScript.httpStatusCode,200);assert.match(articleScript.text,/revealHash/);
  checks.push('Article tabs and citation navigation script is served by WordPress');
  await php(`$snapshot=get_option(Peptide_Atlas_Connector::SNAPSHOT); $snapshot['items']=array(); update_option(Peptide_Atlas_Connector::SNAPSHOT,$snapshot,false);`);
  const withdrawn = await cli.playground.request({ url: '/atlas-peptides/qa-entry/' });
  assert.equal(withdrawn.httpStatusCode, 404); checks.push('Withdrawn local profile returns HTTP 404');
  console.log(JSON.stringify(report, null, 2));
  if (process.env.ATLAS_WP_QA_REPORT) await writeFile(process.env.ATLAS_WP_QA_REPORT, JSON.stringify(report, null, 2));
} catch (error) {
  console.error(String(error.message || error).slice(0,4000));
  process.exitCode = 1;
} finally { await cli[Symbol.asyncDispose](); }
