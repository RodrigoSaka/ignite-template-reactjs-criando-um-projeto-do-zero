import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../services/utils';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';

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
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  const loadMore = async () => {
    const nextUrl = nextPage + '&lang=pt-br';

    await fetch(nextUrl)
      .then(p => p.json())
      .then((response: PostPagination) => {
        const postsRes = response.results.map((post: Post) => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: post.first_publication_date,
          };
        });

        setNextPage(response.next_page);
        setPosts([...posts, ...postsRes]);
      });
  };

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>
      <Header />

      <main className={commonStyles.containerCenter}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={styles.post}>
                <div className={styles.title}>
                  <strong>{post.data.title}</strong>
                </div>
                <div className={styles.subtitle}>{post.data.subtitle}</div>
                <div className={styles.infos}>
                  <div>
                    <FiCalendar />
                    <span>{formatDate(post.first_publication_date)}</span>
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!!nextPage && (
            <div className={styles.loadingMore} onClick={loadMore}>
              Carregar mais posts
            </div>
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
      pageSize: 1,
      lang: 'pt-br',
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(p => ({
      uid: p.uid,
      first_publication_date: p.first_publication_date,
      data: {
        title: p.data.title,
        subtitle: p.data.subtitle,
        author: p.data.author,
      },
    })),
  };

  return { props: { postsPagination } };
};
