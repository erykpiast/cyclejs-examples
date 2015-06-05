import { registerCustomElement, h, Rx } from 'cyclejs';
import createGroup from 'cyclejs-group';

import modelDefinition from './model';


export default function createFileRenameFormElement(tagName) {
    let formClass = tagName;
    let inputClass = formClass + '__input';
    let buttonClass = formClass + '__button';
    let applyButtonClass = buttonClass + '--apply';

    registerCustomElement(tagName, (interactions, properties) => {
        let model = createGroup(modelDefinition);

        model.inject({
            initialValue$: properties.get('value'),
            apply$: interactions.get(`.${formClass}`, 'submit')
                .tap((e) => e.preventDefault()),
            input$: interactions.get(`.${inputClass}`, 'input')
                .map(({ target }) => target.value)
        }, model);

        let vtree$ = Rx.Observable.combineLatest(
            model.value$,
            (value) =>
                h('form', {
                    className: `${formClass}`
                }, [
                    h('input', {
                        className: `${inputClass}`,
                        type: 'text',
                        value: value
                    }),
                    h('button', {
                        type: 'submit',
                        className: `${applyButtonClass}`
                    }, 'Apply')
                ]
            )
        );

        return {
            vtree$,
            value$: model.value$.skip(1)
        };
    });

}