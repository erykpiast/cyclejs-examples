import { Rx } from 'cyclejs';


export default {
    options$: (children$, change$, selectAll$, options$) =>
        Rx.Observable.combineLatest(
            options$,
            change$,
            (options, change) =>
                options.map(({ element, id, selected }) => ({
                    id,
                    element,
                    selected: change.id === id ?
                        change.selected :
                        selected
                }))
        )
        .merge(
            children$.map((children) =>
                children.map((child) => ({
                    id: child.properties.id,
                    selected: child.properties.selected,
                    element: child
                }))
            )
        )
        .merge(
            selectAll$
                .withLatestFrom(
                    options$,
                    (selected, options) =>
                        options.map(({ element, id }) => ({
                            id,
                            element,
                            selected
                        }))
                )
        )
        .distinctUntilChanged((options) =>
            JSON.stringify(options.map(({ id, selected }) => ({
                id, selected
            })))
        ),
    selectedOptions$: (options$) =>
        options$
            .map((options) =>
                options.filter((option) =>
                    !!option.selected
                )
            )
            .distinctUntilChanged((selectedOptions) =>
                JSON.stringify(selectedOptions.map(({ id }) => id))
            )
            .map((options) =>
                options.map(({ element }) =>
                    element
                )
            ),
    allSelected$: (options$) =>
        options$.map((options) =>
            options.every((option) =>
                option.selected
            )
        )
};