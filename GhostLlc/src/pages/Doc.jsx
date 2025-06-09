import { useRef, useState } from "react";
import { toast } from "sonner";
import emailService from "../services/api/Email.service";
import BackButton from "../components/BackButton";

const GuideUploadForm = () => {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = formRef.current;
    if (!form) {
      setIsSubmitting(false);
      toast.error("Form not found. Please try again.");
      return;
    }

    const formData = {
      name: form.name.value,
      email: form.email.value,
      title: form.title.value,
      message: form.message.value,
    };

    try {
      // Send to Ghost email (support@ghostplay.store)
      await emailService.sendNoReplyEmail(
        "support@ghostplay.store",
        `New Guide Submission: ${formData.title}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Ownership Guide Submission</h2>
            <p><strong>Twitter Username:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Game Title:</strong> ${formData.title}</p>
            <p><strong>Guide Details:</strong></p>
            <p>${formData.message.replace(/\n/g, "<br>")}</p>
          </div>
        `,
        `New Guide Submission\nTwitter Username: ${formData.name}\nEmail: ${formData.email}\nGame Title: ${formData.title}\nGuide Details:\n${formData.message}`
      );

      // Send confirmation to user
      await emailService.sendNoReplyEmail(
        formData.email,
        "Thank You for Your Guide Submission",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Submission Received!</h2>
            <p>Thank you, ${
              formData.name
            }, for submitting your ownership guide for <strong>${
          formData.title
        }</strong>.</p>
            <p>We’ll review your guide and get back to you soon. If approved, you’ll receive a reward and a shoutout!</p>
            <p><strong>Your Submission:</strong></p>
            <p>${formData.message.replace(/\n/g, "<br>")}</p>
          </div>
        `,
        `Thank you, ${formData.name}, for submitting your guide for ${formData.title}.\nWe’ll review it and get back to you soon.\n\nYour Submission:\n${formData.message}`
      );

      // Success feedback
      toast.success("Guide submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to submit guide. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-6 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <BackButton className="mb-6" />
      <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4 text-center">
        Submit Your Ownership Guide
      </h2>
      <p className="text-gray-400 text-sm sm:text-base mb-8 text-center max-w-lg mx-auto">
        Help us keep Ghost up to date. Submit accurate ownership guides and earn
        rewards when your submission is approved.
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-5 bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-lg"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm sm:text-base font-medium text-white mb-2"
          >
            Twitter Username
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="@username"
            required
            className="w-full p-3 bg-[#161B22] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] transition-all duration-200 hover:border-gray-400"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm sm:text-base font-medium text-white mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
            className="w-full p-3 bg-[#161B22] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] transition-all duration-200 hover:border-gray-400"
          />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm sm:text-base font-medium text-white mb-2"
          >
            Game Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Call of Duty: Modern Warfare"
            required
            className="w-full p-3 bg-[#161B22] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] transition-all duration-200 hover:border-gray-400"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm sm:text-base font-medium text-white mb-2"
          >
            Ownership Guide Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            placeholder="Include steps, screenshots (optional links), and anything that helps others verify and use the account..."
            required
            className="w-full p-3 bg-[#161B22] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] transition-all duration-200 hover:border-gray-400 resize-vertical"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-br from-blue-800 to-purple-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 ${
            isSubmitting
              ? "opacity-70 cursor-not-allowed"
              : "hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Guide"
          )}
        </button>
      </form>
    </div>
  );
};

export default GuideUploadForm;
