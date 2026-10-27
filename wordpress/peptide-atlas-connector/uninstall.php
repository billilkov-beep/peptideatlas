<?php
if (!defined('WP_UNINSTALL_PLUGIN')) { exit; }
foreach (array('peptide_atlas_settings','peptide_atlas_snapshot','peptide_atlas_status','peptide_atlas_sync_lock') as $option) { delete_option($option); }
wp_clear_scheduled_hook('peptide_atlas_refresh');
