"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { getBrowserApolloClient } from "../apolloClient";

export const SUBSCRIBE_EMAIL_TO_NEWSLETTER_MUTATION = gql`
  mutation SubscribeEmailToNewsletter($email: String!) {
    subscribeEmailToNewsletter(email: $email) {
      status
    }
  }
`;

export type SubscribeEmailToNewsletterResult = {
  subscribeEmailToNewsletter?: {
    status?: string | null;
  } | null;
};

export type SubscribeEmailToNewsletterVariables = {
  email: string;
};

export function useSubscribeEmailToNewsletter() {
  const client = getBrowserApolloClient();

  return useMutation<
    SubscribeEmailToNewsletterResult,
    SubscribeEmailToNewsletterVariables
  >(SUBSCRIBE_EMAIL_TO_NEWSLETTER_MUTATION, { client });
}
