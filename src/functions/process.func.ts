import {Request, Response} from 'express';
import {Configuration} from '..';
import {wrapResponse} from './response-wrapper.func';
import {sendErrorMessage, sendSyncRequest} from './send-request.func';
import isBlank from 'is-blank';

export async function processData(req: Request, res: Response, config: Configuration) {
    try {
        if (isBlank(req.files) || req.files === undefined || req.files.file == null) {
            throw 'No file uploaded';
        }
        res.send(wrapResponse(true));
    } catch (e) {
        res.send(wrapResponse(false, {error: e}));
        sendErrorMessage(e, config);
        return;
    }

    let mappedTargetData;

    try {
        const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
        mappedTargetData = await config.mapping(files.map(f => f.tempFilePath));
    } catch (e) {
        sendErrorMessage(e, config);
        return;
    }

    await sendSyncRequest(mappedTargetData, config)
}
