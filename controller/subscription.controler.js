import Subscription from '../models/subscription.model.js'
import { workflowClient } from '../config/upstash.js'
import { serverURL } from '../config/env.js'

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    let workflowRunId = null;
    let workflowError = null;

    try {
      const workflow = await workflowClient.trigger({
        url: `${serverURL}/api/v1/workflow/subscription/reminder`,
        body: {
          subscriptionId: subscription.id,
        },
        headers: {
          'content-type': 'application/json',
        },
        retries: 0,
      })

      workflowRunId = workflow.workflowRunId;
    } catch (error) {
      workflowError = error.message;
    }

    res.status(201).json({ success: true, data: { subscription, workflowRunId, workflowError } });
  } catch (e) {
    next(e);
  }
}

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if(req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}
