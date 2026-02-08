import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';
import { SiteHeader } from '../components/site-header';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'F1 Statistics',
  description: 'Created by nbjorling',
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         // className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
//         className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
//       >
//         <SidebarProvider
//           style={
//             {
//               '--sidebar-width': 'calc(var(--spacing) * 72)',
//               '--header-height': 'calc(var(--spacing) * 12)',
//             } as React.CSSProperties
//           }
//         >
//           <AppSidebar variant="inset" />
//           <SidebarInset>
//             <>
//               <SiteHeader />
//         {children}
//         </>
//           </SidebarInset>
//         </SidebarProvider>
//       </body>
//     </html>
//   );
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
