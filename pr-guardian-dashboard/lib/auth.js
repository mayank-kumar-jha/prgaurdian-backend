import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token }) {
      // Attach GitHub username and avatar to the session for the Topbar
      if (token?.login) {
        session.user.login = token.login;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = profile.login;
      }
      return token;
    },
  },
});
