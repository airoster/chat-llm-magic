import React from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ModelSelector, type Model } from "@/components/ModelSelector";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const AVAILABLE_MODELS: Model[] = [
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  { id: "o1", name: "OpenAI O1" },
];

const Index = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<Model>(AVAILABLE_MODELS[0]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadApiKeys = () => {
      AVAILABLE_MODELS.forEach((model) => {
        const apiKey = localStorage.getItem(`apiKey_${model.id}`);
        if (apiKey) {
          model.apiKey = apiKey;
        }
      });
    };
    loadApiKeys();
  }, []);

  const callAnthropicAPI = async (content: string, apiKey: string) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        messages: [{ role: "user", content }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  };

  const callOpenAIAPI = async (content: string, apiKey: string) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "o1",
        messages: [{ role: "user", content }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedModel.apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    const newMessage: Message = { role: "user", content };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let response;
      if (selectedModel.id === "claude-3-5-sonnet-20241022") {
        response = await callAnthropicAPI(content, selectedModel.apiKey);
      } else {
        response = await callOpenAIAPI(content, selectedModel.apiKey);
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: response,
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (apiKey: string) => {
    const updatedModel = { ...selectedModel, apiKey };
    setSelectedModel(updatedModel);
    localStorage.setItem(`apiKey_${selectedModel.id}`, apiKey);
    
    toast({
      title: "API Key Saved",
      description: `Your ${selectedModel.name} API key has been saved locally.`,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-chat-background">
      <header className="p-4 border-b border-chat-border bg-white">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-chat-text">Multi-LLM Chat</h1>
          <ModelSelector
            models={AVAILABLE_MODELS}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            {...message}
            model={message.role === "assistant" ? selectedModel.name : undefined}
          />
        ))}
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        modelName={selectedModel.name}
      />
    </div>
  );
};

export default Index;