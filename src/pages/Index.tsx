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
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude-2", name: "Claude 2" },
  { id: "gpt-3.5", name: "GPT-3.5" },
];

const Index = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<Model>(AVAILABLE_MODELS[0]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const { toast } = useToast();

  // Load API keys from localStorage on mount
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

  const handleSendMessage = async (content: string) => {
    if (!selectedModel.apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    // Add user message
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);

    // TODO: Implement actual API call to selected model
    // For now, just echo the message
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `[${selectedModel.name}] Echo: ${content}`,
        },
      ]);
    }, 1000);
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
      {/* Header */}
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            {...message}
            model={message.role === "assistant" ? selectedModel.name : undefined}
          />
        ))}
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} />

      {/* API Key Modal */}
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