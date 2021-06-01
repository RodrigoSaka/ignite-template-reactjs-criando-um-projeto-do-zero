import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import { formatDate } from '../../services/utils';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const readTime = post.data.content.reduce((acc, content) => {
    const wordCount = RichText.asText(content.body).split(' ').length;
    const readMinutes = !!wordCount ? Math.ceil(wordCount / 200) : 0;

    return acc + readMinutes;
  }, 0);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title}</title>
      </Head>
      <Header />

      <div className={styles.banner}>
        <img src={post.data.banner.url} />
      </div>
      <main className={commonStyles.containerCenter}>
        <div className={styles.title}>{post.data.title}</div>
        <div className={styles.infos}>
          <div>
            <FiCalendar />
            <span>{formatDate(post.first_publication_date)}</span>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{readTime} min</span>
          </div>
        </div>
        <div className={styles.content}>
          {post.data.content.map((b, i) => (
            <div key={i}>
              <div className={styles.heading}>{b.heading}</div>
              <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(b.body) }}
              ></div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slugs'],
      lang: 'pt-br',
    }
  );

  const slugs = response.results.map(p => ({ params: { slug: p.uid } }));

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    fetch: ['posts.title', 'posts.content', 'posts.author', 'posts.banner'],
    lang: 'pt-br',
  });

  const post = {
    first_publication_date: response.first_publication_date,
    data: response.data,
    uid: response.uid,
  };

  return {
    props: { post },
  };
};
