import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <>
      <div className={commonStyles.containerCenter}>
        <div className={styles.container}>
          <Link href={'/'}>
            <img src="/logo.png" alt="logo" />
          </Link>
        </div>
      </div>
    </>
  );
}
