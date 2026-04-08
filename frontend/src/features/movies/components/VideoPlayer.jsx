import { getFullMediaUrl } from '@utils/helpers';
import styles from './VideoPlayer.module.css';

function VideoPlayer({ videoUrl }) {
	const fullVideoUrl = getFullMediaUrl(videoUrl);

	if (!fullVideoUrl) {
		return <p className={styles.empty}>Video is not available.</p>;
	}

	return (
		<div className={styles.playerWrap}>
			<video className={styles.player} controls src={fullVideoUrl} preload="metadata" />
		</div>
	);
}

export default VideoPlayer;
