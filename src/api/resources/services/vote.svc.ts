import Vote from '../../../db/models/Vote.model';
import ootpError from '../../lib/error';
import { IVote, OVote } from '../interfaces/vote.intf';

const getVote = async (query: any) => {
  const vote = await Vote.findOne(query).populate('createdBy');
  return vote;
};

const createVote = async (voteDetails: IVote) => {
  const vote = await Vote.create(voteDetails);
  vote.save();
  return vote;
};

const countVotes = async (query: any) => {
  const votes = await Vote.count(query);
  return votes;
};

const updateVote = async (query: any, voteDetails: Partial<OVote>) => {
  const vote = await getVote(query);
  if (!vote) throw new ootpError('No vote with that id exists.', 404);
  vote.set(voteDetails);
  await vote.save();
  return vote;
};

const deleteVote = async (query: any) => {
  const vote = await getVote(query);
  if (!vote) throw new ootpError('No vote with that id exists.', 404);
  await Vote.deleteOne(query);
};

const VoteService = {
  getVote,
  createVote,
  countVotes,
  deleteVote,
  updateVote,
};

export default VoteService;
