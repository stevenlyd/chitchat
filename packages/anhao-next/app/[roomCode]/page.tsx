import { Metadata } from "next";
import Room from "./_ui/Room";

type Props = {
  params: { roomCode: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const roomCode = params.roomCode;
  const username = searchParams.username;

  const manifest =
    roomCode && username
      ? `/api/manifest?roomCode=${roomCode}&username=${username}`
      : undefined;

  return {
    title: "Chitchat",
    description: "A simple chat room",
    ...(manifest ? { manifest } : {}),
  };
}

export default function Page() {
  return <Room />;
}
