import ReactMarkdown from "react-markdown"
import styles from '@/styles/Home.module.css';
import { ChatGPTMessage } from "@/types/openai"
import Image from 'next/image';
import { Avatar, AvatarFallback } from "./ui/avatar"

const ChatMessage = ({ data }: { data: ChatGPTMessage }) => {
  const isAssistant = data.role === "assistant"
  return (
    <div className="flex items-start gap-4 pl-1">
      {/* Avatar */}
      <Avatar
        className={`border-none text-xs font-bold  ${!isAssistant ? "ring-neutral-500" : "ring-emerald-500"
          }`}
      >
        <AvatarFallback
          className={`border-none ${!isAssistant
            ? "text-neutral-950"
            : "text-emerald-950"
            }`}
        >
          {isAssistant ? (
            <Image
              src="/chatbot.png"
              alt="Me"
              width="40"
              height="40"
              className={styles.usericon}
              priority
            />
          ) : (
            <Image
              src="/user.png"
              alt="Me"
              width="40"
              height="40"
              className={styles.usericon}
              priority
            />
          )}
        </AvatarFallback>
      </Avatar>
      {/* Message */}
      <div className="mt-2">
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default ChatMessage
