import dayjs from 'dayjs'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/snd_email.js'
import { NODE_ENV } from '../config/env.js'

const REMINDERS = [7, 5, 2, 1]

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if(!subscription || subscription.status !== 'active') return;

  const renewalDate = dayjs(subscription.renewalDate);

  if(renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');

    if(reminderDate.isBefore(dayjs(), 'day')) {
      continue;
    }

    if(reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
    }

    await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    return Subscription.findById(subscriptionId).populate('user', 'name email');
  })
}

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    })
  })
}

export const testReminderEmail = async (req, res, next) => {
  try {
    if(NODE_ENV === 'production') {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const to = req.body.to;

    if(!to) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const info = await sendReminderEmail({
      to,
      type: '1 days before reminder',
      subscription: {
        name: 'Test Subscription',
        renewalDate: dayjs().add(1, 'day').toDate(),
        currency: 'USD',
        price: 10,
        frequency: 'monthly',
        paymentMethod: 'Test Card',
        user: {
          name: req.body.name || 'Test User',
        },
      },
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    next(error);
  }
}
