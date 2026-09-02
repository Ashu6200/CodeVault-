'use client';

import { Provider } from 'react-redux';
import { store } from '../store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // `store` is already a module-level singleton, so it can be passed straight
  // through. The previous useRef wrapper added nothing and meant reading a ref
  // during render.
  return <Provider store={store}>{children}</Provider>;
}
