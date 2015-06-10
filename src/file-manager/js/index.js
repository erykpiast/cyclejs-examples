import { Rx, h, applyToDOM } from 'cyclejs';
import createGroup from 'cyclejs-group';
import { v1 as uuid } from 'uuid';
import dedent from 'dedent';

import modelDefinition from './model';

import confirm from './components/confirm';
import selectableListComponent from './components/selectable-list';
import filesListItem from './components/files-list-item';
import fileRenameForm from './components/file-rename-form';

selectableListComponent('selectable-list');
filesListItem('files-list-item');
confirm('confirmation-popup');
fileRenameForm('file-rename-form');


// functional style console.log
global.log = function log(...args) {
    return console.log.bind(console, ...args);
};


function computer(interactions) {
    let listId = uuid();
    let listClass = 'files';
    let listItemClass = listClass + '__item';
    let addNewClass = 'add-new';
    let addNewFormClass = addNewClass + '__form';
    let cancelAddingNewButtonClass = addNewClass + '__cancel';
    let navClass = 'nav';
    let buttonClass = navClass + '__button';
    let renameButtonClass = buttonClass + '--rename';
    let removeButtonClass = buttonClass + '--remove';
    let addNewButtonClass = buttonClass + '--add-new';
    let removalConfirmationClass = 'removal-confirmation';
    let removalConfirmationMessageClass = removalConfirmationClass + '__message';

    let newFolderRegex = /^New folder(?: \((\d+)\))?$/;
    function getNewFolderName(files) {
        let lastNewFolder = files.map(({ fileName }) =>
            fileName.match(newFolderRegex)
        ).filter((result) =>
            result
        ).map((result) =>
            'undefined' !== typeof result[1] ?
            parseInt(result[1], 10) :
            0
        ).sort((a, b) => b - a)[0];

        return 'New folder' + ('undefined' !== typeof lastNewFolder ? ` (${lastNewFolder + 1})` : '');
    }

    let model = createGroup(modelDefinition);
    model.inject({
            initialFiles$: Rx.Observable.just(
                Array.from(new Array(10), (value, index) =>
                    `file${index+1}.${[ 'txt', 'doc', 'jpg' ][Math.floor(Math.random() * 3)]}`
                )
                    .map((fileName) => ({
                        fileName,
                        uuid: uuid(),
                        selected: false
                    }))
            ),
            selectedOptions$: interactions.get(`.${listClass}`, 'selectedOptions')
                .map(({ detail }) => detail)
                .map((options) =>
                    options.map((option) =>
                        option.properties.id
                    )
                ),
            renameButtonClick$: interactions.get(`.${renameButtonClass}`, 'click'),
            removeButtonClick$: interactions.get(`.${removeButtonClass}`, 'click'),
            addNewButtonClick$: interactions.get(`.${addNewButtonClass}`, 'click'),
            addingNewConfirmed$: interactions.get(`.${addNewFormClass}`, 'value')
                .map(({ detail }) => detail),
            addingNewCanceled$: interactions.get(`.${cancelAddingNewButtonClass}`, 'click'),
            removalConfirmed$: interactions.get(`.${removalConfirmationClass}`, 'confirm')
                .map(({ detail }) => detail)
                .share(),
            removalCanceled$: interactions.get(`.${removalConfirmationClass}`, 'cancel')
                .map(({ detail }) => detail),
            fileNameChange$: interactions.get(`.${listItemClass}`, 'name')
                .map(({ detail, target }) => ({
                    uuid: target.id,
                    fileName: detail
                }))
        },
        model
    );

    return Rx.Observable.combineLatest(
        model.files$,
        model.renameMode$,
        model.addingNewMode$,
        model.anyFileSelected$,
        model.removalConfirmationVisible$,
        (files, renameMode, addingNewMode, anyFileSelected, removalConfirmationVisible) =>
            h('div', [
                h('div', {
                    className: `${navClass}`
                }, [
                    h('button', {
                        className: `${renameButtonClass}`,
                        disabled: !anyFileSelected || addingNewMode || removalConfirmationVisible
                    }, renameMode ? 'Finish renaming' : 'Rename'),
                    h('button', {
                        className: `${removeButtonClass}`,
                        disabled: renameMode || !anyFileSelected || addingNewMode || removalConfirmationVisible
                    }, 'Remove'),
                    h('button', {
                        className: `${addNewButtonClass}`,
                        disabled: renameMode || addingNewMode || removalConfirmationVisible
                    }, 'New folder')
                ]),
                h('selectable-list', {
                    disabled: renameMode || addingNewMode || removalConfirmationVisible,
                    key: listId,
                    className: `${listClass}`
                },  (addingNewMode ? [
                        h('div', {
                            selected: true
                        }, h('div', {
                            className: `${addNewClass}`
                        }, [
                            h('file-rename-form', {
                                className: `${addNewFormClass}`,
                                value: getNewFolderName(files),
                                key: 'adding-new-file-form'
                            }),
                            h('button', {
                                className: `${cancelAddingNewButtonClass}`
                            }, 'Cancel')
                        ]))
                    ] : [ ]).concat(
                    files.map(({ fileName, uuid, selected }) =>
                        h('div', {
                        // custom elements can't be embedded in other custom elements directly
                        // until we fix it in the core, use plain DIV to wrap
                            id: uuid,
                            selected: selected
                        },
                            h('files-list-item', {
                                key: uuid,
                                id: uuid,
                                name: fileName,
                                renameMode: selected && renameMode,
                                className: `${listItemClass}`
                            })
                        )
                    ))
                )
            ].concat(
                removalConfirmationVisible ? [ h('confirmation-popup', {
                    className: `${removalConfirmationClass}`,
                    key: 'files-removal-confirmation-popup',
                    messages: {
                        confirm: 'Delete',
                        cancel: 'Cancel'
                    }
                }, [
                    h('p', {
                        className: `${removalConfirmationMessageClass}`,
                    }, dedent`Delete selected files?
                    This operation cannot be undone!`),
                    h('ul', files
                        .filter(({ selected }) => selected)
                        .map(({ fileName }) =>
                            h('li', fileName)
                        )
                    )
                ])
            ] : [ ])
        )
    );
}

export default function fileManagerApp(dom) {
    applyToDOM(dom, computer);
}