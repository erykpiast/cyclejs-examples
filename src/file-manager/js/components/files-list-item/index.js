import { registerCustomElement, h, Rx } from 'cyclejs';
import createGroup from 'cyclejs-group';

import fileRenameForm from '../file-rename-form';
import modelDefinition from './model';

fileRenameForm('file-rename-form');


export default function createFilesListItemElement(tagName) {
    let itemClass = tagName;
    let renameFormClass = itemClass + '__rename-form';
    let buttonClass = itemClass + '__button';
    let renameCancelButtonClass = buttonClass + '--rename-cancel';

    registerCustomElement(tagName, (interactions, properties) => {
        let model = createGroup(modelDefinition);

        model.inject({
            id$: properties.get('id'),
            name$: properties.get('name'),
            renameIntent$: properties.get('renameMode'),
            cancelRename$: interactions.get(`.${renameCancelButtonClass}`, 'click')
                .tap((e) => e.preventDefault()),
            finishRename$: interactions.get(`.${renameFormClass}`, 'value')
        }, model);

        let vtree$ = Rx.Observable.combineLatest(
            model.data$,
            model.renameMode$,
            ({ fileId, fileName }, renameMode) =>
                h('div', {
                    className: `${itemClass}`
                }, renameMode ? [
                    h('file-rename-form', {
                        className: `${renameFormClass}`,
                        value: fileName,
                        key: fileId
                    }),
                    h('button', {
                        className: `${renameCancelButtonClass}`
                    }, 'Cancel')
                ] : fileName)
        );

        return {
            vtree$,
            name$: interactions.get(`.${renameFormClass}`, 'value')
                .map(({ detail}) => detail)
        };
    });

}