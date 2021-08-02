import * as Collapsible from "@radix-ui/react-collapsible";

export type CollapseProps = {
  children: React.ReactNode;
  title: string;
};

export const Collapse = (props: CollapseProps) => {
  const { children, title } = props;
  return (
    <Collapsible.Root>
      <Collapsible.Trigger className="block w-full text(sm blue-500 center) my-2">
        {title}
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
};
