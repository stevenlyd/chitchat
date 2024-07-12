import { Chip, Input, ScrollShadow, Tab, Tabs } from "@nextui-org/react";
import { DesktopUIProps } from "./DesktopUI";
import { MessageBlock } from "@/app/_components/message/MessageBlock";

interface MobileUIProps extends DesktopUIProps {}

export default function MobileUI(props: MobileUIProps) {
  const {
    handleMessageChange,
    handleSendMessage,
    inputRef,
    messagesEndRef,
    message,
    messages,
    users,
    username,
    toggleNotificationButton,
    currentRoomCode,
  } = props;

  return (
    <div className="h-full flex flex-col pt-6 pb-20 px-5">
      <Tabs
        fullWidth
        size="lg"
        defaultSelectedKey="chat"
        classNames={{
          base: "flex flex-grow-0 w-full",
          panel: "flex flex-col w-full justify-between flex-grow overflow-auto",
        }}
      >
        <Tab key="users" title="用户" className="flex-grow flex">
          <ScrollShadow className="flex flex-col flex-shrink-0 h-full w-200 bg-gray-900 rounded-lg pt-4 px-3 items-center gap-2">
            {users.map((user) => {
              return (
                <Chip className="overflow-ellipsis max-w-xs" key={user}>
                  {user}
                </Chip>
              );
            })}
          </ScrollShadow>
        </Tab>
        <Tab key="chat" title="消息">
          <div className="w-full items-center flex-grow-0">
            <p className="text-2xl w-full font-bold mb-4 text-center dark:text-white">
              {currentRoomCode}
            </p>
          </div>
          <ScrollShadow
            className="flex-col h-full w-full items-center gap-2 pr-2"
            ref={messagesEndRef}
          >
            {messages.map((message) => {
              const { username, timestamp } = message;
              return (
                <MessageBlock
                  key={`${username}-${timestamp.getMilliseconds()}`}
                  {...message}
                />
              );
            })}
          </ScrollShadow>
          <Input
            value={message}
            autoFocus
            style={{ width: "100%" }}
            placeholder="请输入消息..."
            onChange={handleMessageChange}
            ref={inputRef}
          />
        </Tab>
        <Tab key="settings" title="设置" className="flex-grow flex">
          {toggleNotificationButton}
        </Tab>
      </Tabs>
    </div>
  );
}
