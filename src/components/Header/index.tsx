import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <>
      <div className={commonStyles.containerCenter}>
        <div className={styles.container}>
          <img src="/logo.png" alt="logo" />
        </div>
      </div>
    </>
  );
}
