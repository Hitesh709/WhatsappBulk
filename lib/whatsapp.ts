const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";

export async function sendTemplateMessage(params: {
  to: string;
  templateName: string;
  language: string;
  bodyVariables?: string[];
}) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) throw new Error("WhatsApp API is not configured");

  const components = params.bodyVariables?.length
    ? [{ type: "body", parameters: params.bodyVariables.map(text => ({ type: "text", text })) }]
    : undefined;

  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.to,
      type: "template",
      template: { name: params.templateName, language: { code: params.language }, ...(components ? { components } : {}) }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "WhatsApp API request failed");
  return data;
}
