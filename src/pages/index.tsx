import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../services/utils';
import Head from 'next/head';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <Head>
        <title>Criando um projeto do zero</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="logo" />
        </div>

        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={styles.post}>
                <div className={styles.title}>
                  <strong>{post.data.title}</strong>
                </div>
                <div className={styles.subtitle}>{post.data.subtitle}</div>
                <div className={styles.infos}>
                  <div>
                    <img src="/calendar.svg" alt="calendar" />
                    <span>{post.first_publication_date}</span>
                  </div>
                  <div>
                    <img src="/user.svg" alt="user" />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!!postsPagination.next_page && (
            <div className={styles.loadingMore}>Carregar mais posts</div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      lang: 'pt-br',
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => ({
      uid: post.uid,
      first_publication_date: formatDate(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    })),
  };

  return { props: { postsPagination } };
};
