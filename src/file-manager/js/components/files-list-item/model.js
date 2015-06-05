import { Rx } from 'cyclejs';


export default {
    data$: (name$, id$) =>
        Rx.Observable.combineLatest(
            name$, id$,
            (name, id) => ({
                fileName: name,
                fileId: id
            })
        ),
    renameMode$: (renameIntent$, cancelRename$, finishRename$) =>
        Rx.Observable.merge(
            renameIntent$,
            Rx.Observable.merge(
                finishRename$,
                cancelRename$
            ).map(() => false)
        ).distinctUntilChanged()
};