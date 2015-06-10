import { Rx } from 'cyclejs';
import { v1 as uuid } from 'uuid';


export default {
    files$: (selectedOptions$, initialFiles$, files$, fileNameChange$, removalConfirmed$, addingNewConfirmed$) =>
        Rx.Observable.merge(
            selectedOptions$
                .withLatestFrom(
                    files$,
                    (selectedFiles, files) =>
                        files.map(({ fileName, uuid }) => ({
                            fileName,
                            uuid,
                            selected: selectedFiles.indexOf(uuid) !== -1
                        }))
                ),
            fileNameChange$
                .withLatestFrom(
                    files$,
                    (nameChange, files) =>
                        files.map((file) =>
                            nameChange.uuid === file.uuid ? ({
                                fileName: nameChange.fileName,
                                uuid: file.uuid,
                                selected: file.selected
                            }) : file
                        )
                ),
            removalConfirmed$
                .withLatestFrom(
                    files$,
                    (remove, files) =>
                        files.filter(({ selected }) =>
                            !selected
                        )
                ),
            addingNewConfirmed$
                .withLatestFrom(
                    files$,
                    (newName, files) =>
                        [{
                            fileName: newName,
                            uuid: uuid(),
                            selected: true
                        }].concat(files)
                ),
            initialFiles$
        ).distinctUntilChanged((files) =>
            JSON.stringify(files)
        ),
    anyFileSelected$: (files$) =>
        files$
            .map((files) => !!files.filter(({ selected }) => selected).length)
            .startWith(false)
            .distinctUntilChanged(),
    renameMode$: (renameButtonClick$) =>
        renameButtonClick$
            .scan(false, (previous) =>
                !previous
            )
            .startWith(false)
            .distinctUntilChanged(),
    // mode can be created by factory function, but what about this cyclejs-group DI based on function parameters names?
    addingNewMode$: (addNewButtonClick$, addingNewConfirmed$, addingNewCanceled$) =>
        Rx.Observable.merge(
            Rx.Observable.merge(
                addingNewConfirmed$,
                addingNewCanceled$
            ).map(() => false),
            addNewButtonClick$.map(() => true)
        ).startWith(false)
        .distinctUntilChanged(),
    removalConfirmationVisible$: (removeButtonClick$, removalConfirmed$, removalCanceled$) =>
        Rx.Observable.merge(
            Rx.Observable.merge(
                removalConfirmed$,
                removalCanceled$
            ).map(() => false),
            removeButtonClick$.map(() => true)
        ).startWith(false)
        .distinctUntilChanged()

};

//