<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Semesters settings
 *
 * @package mod_booking
 * @copyright 2022 Wunderbyte GmbH <info@wunderbyte.at>
 * @author Bernhard Fischer
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use mod_booking\form\dynamicpricecategoriesform;
use mod_booking\output\price_categories;

require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

global $OUTPUT;

// No guest autologin.
require_login(0, false);

$cmid = optional_param('id', 0, PARAM_INT);

admin_externalpage_setup('modbookingpricecategories', '', [],
    new moodle_url('/mod/booking/pricecategories.php'));

$settingsurl = new moodle_url('/admin/category.php', ['category' => 'modbookingfolder']);

$pageurl = new moodle_url('/mod/booking/pricecategories.php');
$PAGE->set_url($pageurl);

$PAGE->set_title(
    format_string($SITE->shortname) . ': ' . get_string('pricecategories', 'booking')
);

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('pricecategories', 'mod_booking'));

$pricecategoriesform = new dynamicpricecategoriesform();
$pricecategoriesform->set_data_for_dynamic_submission();
$renderedpricecategoriesform = $pricecategoriesform->render();

if ($cmid) {
    $changepricecategoriesform = new dynamicchangepricecategoriesform();

    $changepricecategoriesform->set_data_for_dynamic_submission();
    $renderedchangepricecategoriesform = $changepricecategoriesform->render();
} else {
    $renderedchangepricecategoriesform = '';
}
// Do we need this part in price categories?

/* $holidaysform = new dynamicholidaysform();
$holidaysform->set_data_for_dynamic_submission();
$renderedholidaysform = $holidaysform->render(); */

$output = $PAGE->get_renderer('mod_booking');
$data = new price_categories($renderedpricecategoriesform, $renderedchangepricecategoriesform);
echo $output->render_price_categories($data);

$existingpricecategories = $DB->get_records('booking_pricecategories');
$PAGE->requires->js_call_amd(
    'mod_booking/dynamicpricecategoriesform',
    'init',
    ['[data-region=pricecategoriesformcontainer]', dynamicpricecategoriesform::class, $existingpricecategories]
);

if ($cmid) {
    $data = new stdClass();
    $data->cmid = $cmid;
    $existingpricecategories = $data;
    $PAGE->requires->js_call_amd(
    'mod_booking/dynamicchangepricecategoriesform',
    'init',
    ['[data-region=changepricecategoriescontainer]', dynamicchangepricecategoriesform::class, $existingpricecategories]
    );
}


echo $OUTPUT->footer();
