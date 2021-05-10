export type LayoutProps = {
  /**
   * Optionally render children
   */
  children?: React.ReactNode;
};

export const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <main className="container mx-auto px-1 md:px-32 lg:px-64 xl:px-96 mb-12">
      {children}
    </main>
  );
};
