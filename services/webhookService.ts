
/**
 * n8n Webhook Integration
 * Optimized for resilience and binary data handling
 */

const SIGNUP_WEBHOOK_URL = 'https://n8n.srv1106977.hstgr.cloud/webhook-test/815e20d7-39c1-485f-ac81-cbf14dc757b3';
const LOGIN_CHECK_WEBHOOK_URL = 'https://n8n.srv1106977.hstgr.cloud/webhook-test/4f70ab27-7453-424e-af21-3f1b85b992c1';
const MAINCORE_WEBHOOK_URL = 'https://n8n.srv1106977.hstgr.cloud/webhook-test/07b05952-fd19-4f31-b20a-97a71551d11a';

export const triggerN8nWorkflow = async (data: any, action: string, customUrl?: string) => {
  const targetUrl = customUrl || SIGNUP_WEBHOOK_URL;
  
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/pdf, */*'
      },
      body: JSON.stringify({
        ...data,
        action: data.action || action,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[n8n Response Error ${response.status}]`, errorText);
        
        if (response.status === 500) {
          throw new Error("n8n Internal Error (500). Please ensure 'Test Workflow' is active in n8n.");
        }
        
        throw new Error(`Synthesis Failed: Server returned status ${response.status}.`);
    }

    const contentType = response.headers.get('content-type');
    
    // If n8n sends a binary PDF directly
    if (contentType && contentType.includes('application/pdf')) {
      return await response.blob();
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      // Return raw text if not JSON (could be a base64 string)
      return { success: true, data: text };
    }

  } catch (error: any) {
    console.error(`[Webhook Failure]`, error);
    if (error.message === 'Failed to fetch') {
      throw new Error("Network Error: Could not connect to n8n. Please ensure the server is online and 'Test Workflow' is running.");
    }
    throw error;
  }
};

export const generateViaMaincore = async (data: any) => {
  return triggerN8nWorkflow(data, 'maincore', MAINCORE_WEBHOOK_URL);
};

export const saveUserToN8n = async (userData: any) => {
  return triggerN8nWorkflow(userData, 'Sign Up');
};

export const loginUserToN8n = async (loginData: any) => {
  return triggerN8nWorkflow(loginData, 'Login Checker', LOGIN_CHECK_WEBHOOK_URL);
};
