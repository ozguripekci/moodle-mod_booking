/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
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

/*
 * @package    mod_booking
 * @copyright  2022 Wunderbyte GmbH <info@wunderbyte.at>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import DynamicForm from 'core_form/dynamicform';
import ModalForm from 'core_form/modalform';
import Templates from 'core/templates';

const optiondateForm = new DynamicForm(document.querySelector('#optiondates-form'), 'mod_booking\\form\\dynamicoptiondateform');

export const initdynamicoptiondateform = (cmid, bookingid, optionid, modalTitle, formClass) => {

    optiondateForm.load({
        'cmid': cmid,
        'bookingid': bookingid,
        'optionid': optionid,
        'modalTitle': modalTitle,
        'formClass': formClass
    })
    .then(() => {
        datelistinit();
        initmodaloptiondateform(modalTitle, formClass);
        return;
    })
    // Deal with this exception (Using core/notify exception function is recommended).
    // eslint-disable-next-line no-undef
    .catch(ex => displayException(ex));

    optiondateForm.addEventListener(optiondateForm.events.SERVER_VALIDATION_ERROR, () => {
        datelistinit();
        initmodaloptiondateform(modalTitle, formClass);
        return;
    });

    optiondateForm.addEventListener(optiondateForm.events.FORM_SUBMITTED, (e) => {

        // Remember values when form gets submitted.
        var chooseperiodvalue = document.querySelector('[name="chooseperiod"]').value;
        var reoccurringdatestringvalue = document.querySelector('[name="reoccurringdatestring"]').value;

        // It is recommended to reload the form after submission because the elements may change.
        // This will also remove previous submission errors. You will need to pass the same arguments to the form
        // that you passed when you rendered the form on the page.
        optiondateForm.load({
            'cmid': cmid,
            'bookingid': bookingid,
            'optionid': optionid,
            'modalTitle': modalTitle,
            'formClass': formClass
        })
        .then(() => {
            // Only do this, if it's not a blocked event.
            /* if (!reoccurringdatestringvalue.trim().toLowerCase().includes('block')) {} */

            e.preventDefault();
            const response = e.detail;

            Templates.renderForPromise('mod_booking/bookingoption_dates', response)
            // It returns a promise that needs to be resolved.
            .then(({html}) => {
                document.querySelector('.optiondates-list').innerHTML = '';
                Templates.appendNodeContents('.optiondates-list', html);
                return;
            })
            // Deal with this exception (Using core/notify exception function is recommended).
            // eslint-disable-next-line no-undef
            .catch(ex => displayException(ex));

            var oldlists = document.getElementsByClassName('optiondates-list');
            while (oldlists.length > 1) {
                oldlists[oldlists.length - 1].parentNode.removeChild(oldlists[oldlists.length - 1]);
            }

            // This is needed to fix datelist bugs.
            datelistinit();

            // We need this, so we don't lose the form data after reloading.
            document.querySelector('[name="chooseperiod"]').value = chooseperiodvalue;
            document.querySelector('[name="reoccurringdatestring"]').value = reoccurringdatestringvalue;
            // Also load the data into the hidden elements which we need to pass the values to the non-dynamic form.
            document.querySelector('#semesterid').value = chooseperiodvalue;
            document.querySelector('#dayofweektime').value = reoccurringdatestringvalue;

            // Initialize modal again.
            initmodaloptiondateform(modalTitle, formClass);

            return;
        })
        // Deal with this exception (Using core/notify exception function is recommended).
        // eslint-disable-next-line no-undef
        .catch(ex => displayException(ex));
    });
};

export const datelistinit = () => {

    var dateform = document.querySelector("#optiondates-form");
    var datelist = document.querySelector(".optiondates-list");

    datelist.parentNode.removeChild(datelist);
    // Important: Move datelist after dateform so $_POST will work in PHP.
    dateform.parentNode.insertBefore(datelist, dateform.nextSibling);

    datelist.addEventListener('click', function(e) {

        let action = e.target.dataset.action;
        let targetid = e.target.dataset.targetid;

        if (action === 'delete') {
            e.target.closest('li').remove();
            document.getElementById(targetid).remove();
        }

        if (action === 'add') {
            let targetElement = e.target.closest('li');
            let date = document.querySelector("#meeting-time");
            let element = '<li><span class="badge bg-primary">' + date.value +
                '</span> <i class="fa fa-trash ml-2 icon-red" data-action="delete"></i></li>';
            targetElement.insertAdjacentHTML('afterend', element);
        }
    });

    // Add an event listener to the chooseperiod autocomplete to store semesterid in a hidden input field.
    // We need this, so we can save it later via $_POST from the not dynamic moodle form.
    document.querySelector('[name="chooseperiod"]').addEventListener('change', (e) => {
        document.querySelector('#semesterid').value = e.target.value;
    });

    waitForElm('input[name="reoccurringdatestring"]').then((stringelm) => {
        const submitbutton = document.querySelector('#optiondates-form input[name="submitbutton"]');
        if (stringelm.value.trim().toLowerCase().includes('block')) {
            submitbutton.style.display = 'none'; // Hide the button.
        } else {
            submitbutton.style.display = 'block'; // Show the button.
        }
    });

    // Add an event listener to the reoccurring datestring to store it in a hidden input field.
    // We need this, so we can save it later via $_POST from the not dynamic moodle form.
    const reoccurringdatestring = document.querySelector('input[name="reoccurringdatestring"]');
    reoccurringdatestring.addEventListener('keyup', (e) => {
        const submitbutton = document.querySelector('#optiondates-form input[name="submitbutton"]');
        if (e.target.value.trim().toLowerCase().includes('block')) {
            submitbutton.style.display = 'none'; // Hide the button.
        } else {
            submitbutton.style.display = 'block'; // Show the button.
        }
        document.querySelector('#dayofweektime').value = e.target.value;
    });
};

export const initmodaloptiondateform = (modalTitle, formClass) => {
    waitForElm('button[name="customdatesbtn"]').then((customdatesbtn) => {
        customdatesbtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalform = new ModalForm({
                formClass,
                modalConfig: {title: modalTitle},
                returnFocus: e.currentTarget
            });
            // If necessary extend functionality by overriding class methods, for example:
            modalform.addEventListener(modalform.events.FORM_SUBMITTED, (e) => {
                const response = e.detail;

                Templates.renderForPromise('mod_booking/bookingoption_dates_custom_list_items', response)
                // It returns a promise that needs to be resolved.
                .then(({html}) => {
                    Templates.appendNodeContents('ul.reoccurringdates', html);
                    return;
                })
                // Deal with this exception (Using core/notify exception function is recommended).
                // eslint-disable-next-line no-undef
                .catch(ex => displayException(ex));

                Templates.renderForPromise('mod_booking/bookingoption_dates_custom_hidden_inputs', response)
                // It returns a promise that needs to be resolved.
                .then(({html}) => {
                    Templates.appendNodeContents('div.optiondates-list', html);
                    return;
                })
                // Deal with this exception (Using core/notify exception function is recommended).
                // eslint-disable-next-line no-undef
                .catch(ex => displayException(ex));
            });
            // Show the modal.
            modalform.show();
        });
    });
};

/**
 * Wait until a certain element is loaded.
 * @param {string} selector - The element selector.
 * @returns {Promise}
 */
 function waitForElm(selector) {
    // eslint-disable-next-line consistent-return
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
