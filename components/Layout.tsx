export type LayoutProps = {
  /**
   * Optionally render children
   */
  children?: React.ReactNode;
};

export const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <main className="container mx-auto px-1 md:px-32 ld:px-64 mb-12">
      {children}
    </main>
  );
};
