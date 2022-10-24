export default {
  async fetch(request: Request) {
    // only send the mail on "POST", to avoid spiders, etc.
    if (request.method == "POST") {
      const senderHostname = new URL(request.headers.get("referer") as string).hostname;

      let content = "";
      const subject = "New message from " + senderHostname;

      const formData: FormData = await request.formData();
      const keyValuePairs = formData.entries();
      const name = formData.get("name");

      for (const pair of keyValuePairs) {
        content += `${pair[0]}: ${pair[1]}\n`;
      }

      let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: "to@example.com", name: "Support" }],
            },
          ],
          from: {
            email: "from@example.com",
            name: name ? name : "Form",
          },
          subject: subject,
          content: [
            {
              type: "text/plain",
              value: content,
            },
          ],
        }),
      });

      const res = await fetch(send_request);
      const status = res.status;
      const text = await res.text();

      return new Response(text, { status: status });
    }

    return new Response("Not found", {
      status: 404,
    });
  },
};
