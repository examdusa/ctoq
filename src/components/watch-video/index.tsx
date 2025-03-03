import { Modal } from "@mantine/core";

interface Props {
  open: boolean;
  close: VoidFunction;
}

function WatchVideo({ open, close }: Props) {
  return (
    <Modal size={"xl"} title={undefined} opened={open} onClose={close} centered>
      <video
        src="/videos/intro.mp4"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 5,
        }}
        controls
        controlsList="nodownload"
      />
    </Modal>
  );
}

export { WatchVideo };
