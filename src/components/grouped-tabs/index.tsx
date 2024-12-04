"use client";
import { FloatingIndicator, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import classes from "./styles.module.css";

interface Props {
    items: string[]
    activeIdx: number;
    setActiveIdx: (idx: number) => void
}

export default function GroupedTabs({items, activeIdx, setActiveIdx}:Props) {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});

  const setControlRef = (index: number) => (node: HTMLButtonElement) => {
    controlsRefs[index] = node;
    setControlsRefs(controlsRefs);
  };

  const controls = items.map((item, index) => (
    <UnstyledButton
      key={item}
      className={classes.control}
      ref={setControlRef(index)}
      onClick={() => setActiveIdx(index)}
      mod={{ active: activeIdx === index }}
    >
      <span className={classes.controlLabel}>{item}</span>
    </UnstyledButton>
  ));

  return (
    <div className={classes.root} ref={setRootRef}>
      {controls}
      <FloatingIndicator
        target={controlsRefs[activeIdx]}
        parent={rootRef}
        className={classes.indicator}
      />
    </div>
  );
}
