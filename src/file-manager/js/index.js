import { Rx, h, applyToDOM } from 'cyclejs';
import createGroup from 'cyclejs-group';
import { v1 as uuid } from 'uuid';

import modelDefinition from './model';

import selectableListComponent from './components/selectable-list';
import filesListItem from './components/files-list-item';

selectableListComponent('selectable-list');
filesListItem('files-list-item');


// functional style console.log
global.log = function log(...args) {
    return console.log.bind(console, ...args);
};


function computer(interactions) {
    let listId = uuid();
    let listClass = 'files';
    let listItemClass = listClass + '__item';
    let navClass = 'nav';
    let buttonClass = navClass + '__button';
    let renameButtonClass = buttonClass + '--rename';
    let renameCancelButtonClass = buttonClass + '--rename-cancel';
    let removeButtonClass = buttonClass + '--remove';

    let model = createGroup(modelDefinition);
    model.inject({
            initialFiles$: Rx.Observable.just(
                [ 'file1.txt', 'file2.jpg', 'file3.doc' ]
                    .map((fileName) => ({
                        fileName,
                        uuid: uuid(),
                        selected: !!Math.round(Math.random())
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
            renameCancelButtonClick$: interactions.get(`.${renameCancelButtonClass}`, 'click'),
            removeButtonClick$: interactions.get(`.${removeButtonClass}`, 'click'),
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
        model.anyFileSelected$,
        (files, renameMode, anyFileSelected) =>
            h('div', [
                h('div', {
                    className: `${navClass}`
                }, [
                    h('button', {
                        className: `${renameButtonClass}`,
                        disabled: !anyFileSelected
                    }, renameMode ? 'Finish renaming' : 'Rename'),
                    h('button', {
                        className: `${removeButtonClass}`,
                        disabled: renameMode || !anyFileSelected
                    }, 'Remove')
                ]),
                h('selectable-list', {
                    disabled: renameMode,
                    key: listId,
                    className: `${listClass}`
                }, files.map(({ fileName, uuid, selected }) =>
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
            ])
        );
}

export default function fileManagerApp(dom) {
    applyToDOM(dom, computer);
}