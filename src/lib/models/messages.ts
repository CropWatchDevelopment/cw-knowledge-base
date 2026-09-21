/**
 * The words of the site itself (buttons, labels, notices). Page content lives in `static/content/`.
 * Adding a language means adding it to `LOCALES` and adding its block here; TypeScript checks the rest.
 */
import type { Locale } from './locale.ts';

const en = {
	knowledgeBase: 'Knowledge Base',
	openApp: 'Open the CropWatch app',
	contactSupport: 'Contact support',
	changeLanguage: 'Change language',
	openMenu: 'Open menu',
	closeMenu: 'Close menu',
	sectionsNav: 'Knowledge base sections',
	breadcrumb: 'Breadcrumb',

	searchLabel: 'Search the knowledge base',
	searchPlaceholder: 'Search guides, for example: install a gateway',
	searchPlaceholderShort: 'Search guides',
	searchButton: 'Search',
	searchTitle: 'Search',
	searchPrompt: 'Type a word or two to find a guide.',
	searchAll: (query: string) => `See all results for “${query}”`,
	searchCount: (count: number, query: string) =>
		`${count} ${count === 1 ? 'guide' : 'guides'} for “${query}”`,
	searchEmpty: (query: string) =>
		`No guides match “${query}”. Try a different word, or browse by topic.`,

	heroTitle: 'Find answers about CropWatch',
	heroSubtitle: 'Guides for sensors, gateways, the dashboard, and the ideas behind the numbers.',
	popular: 'Popular:',
	browseByTopic: 'Browse by topic',
	allGuidesIn: (topic: string) => `All guides in ${topic}`,
	startHere: 'Start here',
	videoDemo: 'Video demo',
	noGuidesYet: 'Guides for this topic are on the way.',

	onThisPage: 'On this page',
	copySectionLink: 'Copy link to this section',
	copyPageLink: 'Copy link to this page',
	linkCopied: 'Link copied',
	relatedLinks: 'Related links',
	opensInNewTab: 'Opens in a new tab',
	watchDemo: 'Watch the demo',
	playVideo: (title: string) => `Play demo video: ${title}`,
	videoNote: 'Plays here on the page. The video is hosted on YouTube.',
	pictureComing: 'Picture coming soon',
	expandPicture: 'Open this picture larger',
	closePicture: 'Close the picture',
	notInThisLanguage: 'Not in English yet, so this opens the home page',

	notFoundTitle: 'Page not found',
	notFoundBody: 'The page may have moved, or the link may be out of date.',
	errorTitle: 'Something went wrong',
	errorBody: 'Please try again in a moment.',
	backHome: 'Back to the knowledge base'
};

export type Messages = typeof en;

const ja: Messages = {
	knowledgeBase: 'ナレッジベース',
	openApp: 'CropWatchアプリを開く',
	contactSupport: 'サポートに問い合わせ',
	changeLanguage: '言語を変更',
	openMenu: 'メニューを開く',
	closeMenu: 'メニューを閉じる',
	sectionsNav: 'ナレッジベースのセクション',
	breadcrumb: 'パンくずリスト',

	searchLabel: 'ナレッジベースを検索',
	searchPlaceholder: 'ガイドを検索（例：ゲートウェイの設置）',
	searchPlaceholderShort: 'ガイドを検索',
	searchButton: '検索',
	searchTitle: '検索',
	searchPrompt: 'キーワードを入力してガイドを探します。',
	searchAll: (query) => `「${query}」の検索結果をすべて見る`,
	searchCount: (count, query) => `「${query}」のガイド：${count}件`,
	searchEmpty: (query) =>
		`「${query}」に一致するガイドはありません。別のキーワードを試すか、トピックから探してください。`,

	heroTitle: 'CropWatchの使い方を調べる',
	heroSubtitle:
		'センサー、ゲートウェイ、ダッシュボード、そして数値の背景にある考え方を解説します。',
	popular: 'よく見られるガイド：',
	browseByTopic: 'トピックから探す',
	allGuidesIn: (topic) => `${topic}のガイド一覧`,
	startHere: 'まずはここから',
	videoDemo: 'デモ動画あり',
	noGuidesYet: 'このトピックのガイドは準備中です。',

	onThisPage: 'このページの内容',
	copySectionLink: 'このセクションへのリンクをコピー',
	copyPageLink: 'ページのリンクをコピー',
	linkCopied: 'リンクをコピーしました',
	relatedLinks: '関連リンク',
	opensInNewTab: '新しいタブで開きます',
	watchDemo: 'デモ動画を見る',
	playVideo: (title) => `デモ動画を再生：${title}`,
	videoNote: 'このページ上で再生されます。動画はYouTubeで公開されています。',
	pictureComing: '画像準備中',
	expandPicture: 'この画像を拡大する',
	closePicture: '画像を閉じる',
	notInThisLanguage: '日本語版はまだないため、トップページを開きます',

	notFoundTitle: 'ページが見つかりません',
	notFoundBody: 'ページが移動したか、リンクが古い可能性があります。',
	errorTitle: '問題が発生しました',
	errorBody: 'しばらくしてから、もう一度お試しください。',
	backHome: 'ナレッジベースのトップへ'
};

export const MESSAGES: Record<Locale, Messages> = { en, ja };
