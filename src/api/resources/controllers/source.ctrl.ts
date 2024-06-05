import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import SourceService from '../services/source.svc';
import {
  validateCreateSourceInputs,
  validateDeleteSourcesInputs,
  validateUpdateSourceInputs,
} from '../validators/source.vld';

const handleGetSource = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const source = await SourceService.getSource({ _id: id });

    if (!source) throw new ootpError('Source not found', 404);

    return success({
      res,
      data: source,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while getting source.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetSources = async (req: Request, res: Response) => {
  try {
    const search = (req.query?.search || '') as string;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;
    const sortBy = (req.query?.sortBy || 'createdAt') as string;
    const orderBy = (req.query.orderBy || 'desc') as SortOrder;
    const country = req.query?.country as string;

    const sources = await SourceService.getSources({
      search,
      query: {},
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy]: orderBy },
      country,
    });

    return success({
      res,
      data: sources,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting sources.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleCreateSource = async (req: Request, res: Response) => {
  try {
    const { name, image, searchUrl, country } = validateCreateSourceInputs(req, res);

    const source = await SourceService.createSource({
      name,
      image,
      searchUrl,
      country,
    });

    return success({
      res,
      data: source,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while creating source.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleReplaceSource = async (req: Request, res: Response) => {
  try {
    const source = req.body.source;
    const newSourceId = req.body.newSourceId;

    await SourceService.replaceSource(source, newSourceId);

    return success({
      res,
      data: 'Source replaced successfully',
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    console.log(error);
    return failure({
      res,
      message: error.message || 'An error occured while creating source.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleUpdateSourceStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const value = validateUpdateSourceInputs(req, res);

    const updatedSource = await SourceService.updateSource({
      query: { _id: id },
      sourceDetails: value,
    });

    return success({
      res,
      data: updatedSource,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while updating source.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleDeleteSource = async (req: Request, res: Response) => {
  try {
    const { ids } = validateDeleteSourcesInputs(req, res);

    await SourceService.deleteSources(ids);

    return success({
      res,
      data: 'Source(s) deleted successfully.',
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while deleting sources.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export {
  handleGetSource,
  handleGetSources,
  handleUpdateSourceStatus,
  handleCreateSource,
  handleDeleteSource,
  handleReplaceSource,
};
