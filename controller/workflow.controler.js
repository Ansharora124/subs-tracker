import dayjs from "dayjs";
import { serve } from "@upstash/workflow/express";
import Subscription from "../models/subscription.model.js";

const REMINDER=[7,5,2,1];

const extractSubscriptionId = (payload) => {
  if (!payload) return null;

  if (typeof payload === "string") {
    try {
      const parsedPayload = JSON.parse(payload);
      return extractSubscriptionId(parsedPayload);
    } catch {
      return null;
    }
  }

  if (typeof payload !== "object") return null;

  return (
    payload.subscriptionId
    || payload.body?.subscriptionId
    || payload.data?.subscriptionId
    || payload.payload?.subscriptionId
    || null
  );
};

export const sendReminders = serve(async (context) => {
  try {
    const requestPayload = context.requestPayload;
    const subscriptionId = extractSubscriptionId(requestPayload);

    console.log(`[Workflow] Received reminder request for subscription: ${subscriptionId || 'missing'}`);
    
    if (!subscriptionId) {
      console.log('[Workflow] Failed: subscriptionId is required');
      return { 
        success: false, 
        message: 'subscriptionId is required' 
      };
    }

    const subscription = await Subscription.findById(subscriptionId).populate('user');

    if (!subscription || subscription.status !== 'active') {
      console.log(`[Workflow] Skipped: subscription not found or inactive. ID: ${subscriptionId}`);
      return { 
        success: false, 
        message: 'Subscription not found or not active' 
      };
    }

    console.log(`[Workflow] Subscription status: ${subscription.status}. Name: ${subscription.name}`);

    const renewalDate = dayjs(subscription.renewalDate);
    
    if (renewalDate.isBefore(dayjs())) {
      console.log(`[Workflow] Renewal date passed for ${subscription._id}. No reminders created.`);
      return { 
        success: true, 
        message: 'Renewal date has passed' 
      };
    }

    const reminders = [];
    for (const beforeDays of REMINDER) {
      const reminderDate = renewalDate.subtract(beforeDays, 'day');
      if (reminderDate.isAfter(dayjs())) {
        console.log(`[Workflow] Reminder created: ${beforeDays} day(s) before on ${reminderDate.toISOString()}`);
        reminders.push({
          beforeDays,
          reminderDate: reminderDate.toDate(),
          label: `reminder-${beforeDays}-days`
        });
      } else {
        console.log(`[Workflow] Reminder skipped: ${beforeDays} day(s) before is in the past.`);
      }
    }

    console.log(`[Workflow] Scheduled ${reminders.length} reminder(s) for subscription ${subscription._id}`);

    return {
      success: true,
      data: {
        subscriptionId: subscription._id,
        reminders: reminders.length,
        scheduledReminders: reminders
      }
    };

  } catch (error) {
    console.error('Error in sendReminders:', error);
    return {
      success: false,
      message: 'Error processing reminders',
      error: error.message
    };
  }
});

