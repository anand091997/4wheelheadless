"use client";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSubscribeEmailToNewsletter } from "@/framework/graphql";

type NewsletterForm = {
  email: string;
};

export default function NewsletterSubscribe() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterForm>();
  const [subscribeEmailToNewsletter, { loading: isSubmitting }] = useSubscribeEmailToNewsletter();

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const { data } = await subscribeEmailToNewsletter({
        variables: { email },
      });

      const status = data?.subscribeEmailToNewsletter?.status;
      if (!status) {
        throw new Error("Unexpected response from newsletter service.");
      }

      toast.success("Subscribed successfully.");
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Subscription failed.";
      toast.error(message);
    }
  });

  return (
    <section className="relative bg-[url('/assets/images/subscribe_bg_mobile.webp')] bg-cover bg-center bg-no-repeat py-10 md:py-14 md:bg-[url('/assets/images/newsletter_bg.webp')]">
      <div className="container relative z-10 md:flex md:items-center md:gap-x-7">
        <div className="flex-1">
          <h2 className="text-[28px] font-bold leading-tight mb-5 text-black max-md:text-3xl">
            Subscribe To Our News letter
          </h2>
          <p className="max-w-3xl text-sm text-[#51565B]">
            Stay updated with the latest deals, product launches, and off-road tips - subscribe to
            the 4 Wheel Parts newsletter today!
          </p>
        </div>

        <div className="flex-1">
          <form onSubmit={onSubmit} className="mt-8 md:mt-0 flex max-w-4xl md:p-2 md:bg-white">
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
              className="h-10 w-full bg-white py-2 px-4 text-sm text-[#5d6d8a] outline-none placeholder:text-[#7a88a1]"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 bg-[#ff0e2a] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:w-80"
            >
              {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </button>
          </form>

          {errors.email ? <p className="mt-2 text-sm text-[#9c1b1b]">{errors.email.message}</p> : null}
        </div>
      </div>
    </section>
  );
}
