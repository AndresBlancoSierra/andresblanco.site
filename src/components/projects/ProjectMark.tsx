/**
 * ProjectMark — minimal monochrome line marks for featured projects.
 *
 * One consistent visual language: 24×24 viewBox, 1.5px stroke, no fill, no
 * color. Inherits currentColor so it stays within the gray scale of the theme
 * and never reads as a logo wall.
 */
interface Props {
  slug: string;
  className?: string;
}

function svg(children: React.ReactNode, className: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ProjectMark({ slug, className = 'h-5 w-5' }: Props) {
  switch (slug) {
    case 'what':
      // doubled music note — lyrics learning with songs
      return svg(
        <>
          <path d="M8 17V4l9-1v13" />
          <circle cx="6" cy="17" r="2.2" />
          <circle cx="15" cy="16" r="2.2" />
        </>,
        className,
      );
    case 'portrait-dataset-builder':
      // detection frame with a face — portrait dataset
      return svg(
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="11" r="2.5" />
          <path d="M8.5 17c.5-2 2-3 3.5-3s3 1 3.5 3" />
        </>,
        className,
      );
    case 'opencode-telegram-controller':
      // chat bubble — telegram controller
      return svg(
        <>
          <path d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3z" />
          <circle cx="9" cy="10" r="0.6" />
          <circle cx="12" cy="10" r="0.6" />
          <circle cx="15" cy="10" r="0.6" />
        </>,
        className,
      );
    case 'guitar-hero-controller':
      // guitar pick — physical controller
      return svg(
        <path d="M12 2.5c3.2 3.6 5 6.3 5 9.2a5 5 0 0 1-10 0c0-2.9 1.8-5.6 5-9.2z" />,
        className,
      );
    case 'cp2077-ui-react':
      // nested diamonds — angular UI motif
      return svg(
        <>
          <path d="M12 3l9 9-9 9-9-9 9-9z" />
          <path d="M12 7.5l4.5 4.5-4.5 4.5-4.5-4.5 4.5-4.5z" />
        </>,
        className,
      );
    case 'physical-evolution-system':
      // upward arrow over a baseline — progression, PRs, XP
      return svg(
        <>
          <path d="M4 20h16" />
          <path d="M12 4v11" />
          <path d="m8 9 4-5 4 5" />
        </>,
        className,
      );
    default:
      // neutral node — generic system mark
      return svg(
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
        </>,
        className,
      );
  }
}

export default ProjectMark;