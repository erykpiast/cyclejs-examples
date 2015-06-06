import { Rx } from 'cyclejs';


export default {
    files$: (selectedOptions$, initialFiles$, files$, fileNameChange$, removalConfirmed$) =>
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
            initialFiles$
        ).distinctUntilChanged((files) =>
            JSON.stringify(files)
        ),
    renameMode$: (renameButtonClick$) =>
        renameButtonClick$
            .scan(false, (previous) =>
                !previous
            )
            .startWith(false)
            .distinctUntilChanged(),
    anyFileSelected$: (files$) =>
        files$
            .map((files) => !!files.filter(({ selected }) => selected).length)
            .startWith(false)
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