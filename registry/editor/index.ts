export {
  CodeMirrorEditor,
  type CodeMirrorEditorRef,
  type CodeMirrorEditorProps,
} from "./codemirror-editor";
export {
  getLanguageExtension,
  detectLanguage,
  languageDisplayNames,
  fileExtensionToLanguage,
  type SupportedLanguage,
} from "./languages";
export {
  coreSetup,
  minimalSetup,
  defaultExtensions,
  minimalExtensions,
  notebookEditorTheme,
} from "./extensions";
export {
  lightTheme,
  darkTheme,
  getTheme,
  getAutoTheme,
  isDarkMode,
  prefersDarkMode,
  documentHasDarkClass,
  type ThemeMode,
} from "./themes";
