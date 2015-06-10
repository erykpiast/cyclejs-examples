import { registerCustomElement, h, Rx } from 'cyclejs';
import FocusHook from 'cyclejs/node_modules/virtual-dom/virtual-hyperscript/hooks/focus-hook';
import createGroup from 'cyclejs-group';


export default function createFileRenameFormElement(tagName) {
    let formClass = tagName;
    let inputClass = formClass + '__input';
    let buttonClass = formClass + '__button';
    let applyButtonClass = buttonClass + '--apply';

    registerCustomElement(tagName, (interactions, properties) => {
        let model = createGroup({
            value$: (initialValue$, apply$, input$) =>
                apply$.withLatestFrom(
                    input$.merge(initialValue$),
                    (apply, input) => input
                ).merge(initialValue$)
        });

        model.inject({
            initialValue$: properties.get('value').take(1),
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
                        value: value,
                        'focus-hook': new FocusHook()
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