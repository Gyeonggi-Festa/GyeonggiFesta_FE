import  {useState} from "react";
import styles from "./css/FestivalDescription.module.css";

interface FestivalDescriptionProps {
    content: string;
}

export default function FestivalDescription(
    {content} : FestivalDescriptionProps
) {
    const [isExpanded, setIsExpanded] = useState(false);

    const shouldTruncate = content.length > 200;

    const displayedText = isExpanded || !shouldTruncate
        ? content
        : content.slice(0, 100) + "...";

    return (
        <div className={styles.container}>
            <p className={styles.label}>공연 설명</p>
            <p className={styles.content}>{displayedText}</p>
            {
                shouldTruncate && (
                    <button className={styles.toggleBtn} onClick={() => setIsExpanded(!isExpanded)}>
                        {
                            isExpanded
                                ? "접기"
                                : "더보기"
                        }
                    </button>
                )
            }
        </div>
    );
}