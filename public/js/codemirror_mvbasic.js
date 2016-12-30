(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    CodeMirror.defineMode('mvbasic', function () {

        var words = {};

        function define(style, string) {
            var split = string.split(' ');
            for (var i = 0; i < split.length; i++) {
                words[split[i]] = style;
            }
        }

        // Atoms
        define('atom', '@TRUE @FALSE @DATE');

        // Keywords
        define('keyword', 'NOTHING COMMON.TAB COM.TAB'
            + ' OPEN_FILE READS INPUTS IS.SUB VERSION'
            + ' STATUS RSTATUS HSTATUS REPLY DONE VALUE RETVAL'
            + ' FILE ID ITEM OK MASTER.ID MASTER.ITEM');

        // Commands
        define('builtin', '!ASYNC !ERRNO !FCMP !INTS !MATCHES !MESSAGE !TIMDAT #INCLUDE '
            + ' $CHAIN $COPYRIGHT $DEFINE $EJECT $ELSE $ENDIF $IFNDEF $INCLUDE '
            + ' $INDEF $INSERT $MAP $OPTIONS $PAGE $UNDEFINE ABORT ABS '
            + ' ABSS ACOS ADDS ALPHA ANDS ASCII ASIN ASSIGNED ATAN '
            + ' AUTHORIZATION AUXMAP BITAND BITNOT BITOR BITRESET BITSET '
            + ' BITTEST BITXOR BREAK BSCAN BYTE BYTELEN BYTETYPE BYTEVAL CALL '
            + ' CASE CATS CHAIN CHANGE CHAR CHARS CHECKSUM CLEAR CLEARDATA '
            + ' CLEARFILE CLEARPROMPTS CLEARSELECT CLOSE CLOSESEQ COL1 COL2 '
            + ' COMMIT COMMON COMPARE CONSTANTS CONTINUE CONVERT CONVERT COS '
            + ' COSH COUNT COUNTS CREATE CRT DATA DATE DCOUNT DEBUG DEFFUN DEL '
            + ' DELETE DELETE DELETELIST DELETEU DIMENSION DISPLAY DIV DIVS DIM'
            + ' DO DOWNCASE DQUOTE DTX EBCDIC ECHO END ENTER EQS EQUATE EREPLACE '
            + ' ELSE ERRMSG EXCHANGE EXECUTE EXIT EXP EXTRACT FADD FDIV FFIX FFLT '
            + ' FIELD FIELDS FIELDSTORE FILEINFO FILELOCK FILEUNLOCK FIND '
            + ' FINDSTR FIX FLUSH FMT FMTDP FMTS FMTSDP FMUL FOLD FROM FOLDDP '
            + ' FOOTING FOR FORMLIST FSUB FUNCTION GES GET GETLIST GETLOCALE '
            + ' GETREM GETX GOSUB GOTO GROUP GROUPSTORE GTS HEADING HUSH '
            + ' ICHECK ICONV ICONVS IF IF IFS ILPROMPT INCLUDE INDEX INDEXS '
            + ' INDICES INMAT INPUT INPUTCLEAR INPUTDISP INPUTDP INPUTERR '
            + ' INPUTIF INPUTNULL INPUTTRAP INS INSERT INT ISNULL ISNULLS '
            + ' ITYPE KEYEDIT KEYEXIT KEYIN KEYTRAP LEFT LEN LENDP LENS LENSDP '
            + ' LES LET LN LOCALEINFO LOCATE LOCK LOOP LOWER LTS MAT MATBUILD '
            + ' MATCHFIELD MATPARSE MATREAD MATREADL MATREADU MATWRITE '
            + ' MATWRITEU MAXIMUM MINIMUM MOD MODS MULS NAP NEG NEGS NES NEXT '
            + ' NOBUF NOT NOTS NULL NUM NUMS OCONV OCONVS ON OPEN OPENCHECK '
            + ' OPENDEV OPENPATH OPENSEQ ORS PAGE PERFORM PRECISION PRINT '
            + ' PRINTER PRINTERR PROCREAD PROCWRITE PROGRAM PROMPT PWR QUOTE '
            + ' RAISE RANDOMIZE READ READBLK READL READLIST READNEXT READSEQ '
            + ' READT READU READV READVL READVU REAL RECORDLOCK RECORDLOCKED '
            + ' RELEASE REM REM REMOVE REMOVE REPEAT REPLACE RETURN REUSE '
            + ' REVREMOVE REWIND RIGHT RND ROLLBACK SADD SCMP SDIV SEEK SELECT '
            + ' SELECTE SELECTINDEX SELECTINFO SEND SENTENCE SEQ SEQS SET '
            + ' SETLOCALE SETREM SIN SINH SLEEP SMUL SOUNDEX SPACE SPACES '
            + ' SPLICE SQRT SQUOTE SSELECT SSUB STATUS STATUS STOP STORAGE STR '
            + ' STRS SUBR SUBROUTINE SUBS SUBSTRINGS SUM SUMMATION SYSTEM '
            + ' TABSTOP TAN TANH TERMINFO THEN TIME TIMEDATE TIMEOUT TO TPARM TPRINT '
            + ' TRANS TRANSACTION TRANSACTION TRANSACTION TRIM TRIMB TRIMBS '
            + ' UNTIL TRIMF TRIMFS TRIMS TTYCTL TTYGET TTYSET UNASSIGNED UNICHAR '
            + ' UNICHARS UNISEQ UNISEQS UNLOCK UPCASE UPRINT U VARIABLES WEOF '
            + ' WEOFSEQ WRITE WRITEBLK WRITELIST WRITESEQ WRITESEQF WRITET '
            + ' WRITEU WRITEV WRITEVU XLATE XTD');


        function tokenBase(stream, state) {
            if (stream.eatSpace()) return null;

            var sol = stream.sol();
            var ch = stream.next();

            if (ch === '\'' || ch === '"') {
                state.tokens.unshift(tokenString(ch));
                return tokenize(stream, state);
            }
            if (ch === '*' && (sol || state.semicolon)) {
                state.semicolon = false;
                stream.skipToEnd();
                return 'comment';
            }
            state.semicolon = false;
            if (ch === ';') {
                state.semicolon = true;
                return 'operator';
            }
            if (ch === ','
                || ch === '(' || ch === ')'
                || ch === '[' || ch === ']') {
                return 'operator';
            }

            if (ch === '+'
                || ch === '*' || ch === '/'
                || ch === '=' || ch === '#'
                || ch === '<' || ch === '>') {
                return 'operator';
            }

            if (/\d/.test(ch)) {
                stream.eatWhile(/\d/);
                if (stream.eol() || !/\w/.test(stream.peek())) {
                    return 'number';
                }
            }
            stream.eatWhile(/[\w.]/);
            var cur = stream.current();
            if (stream.peek() === '=' && /\w+/.test(cur)) {
                return 'def';
            }
            if (cur === "INCLUDE") {
                stream.skipToEnd();
                return "link"
            }
            if (cur.startsWith("F.")) {
                return "meta";
            }
            if (cur.startsWith("SAVE.") || cur.startsWith("LOAD.") || cur.startsWith("FORMAT.")) {
                return "link";
            }

            var xType = words.hasOwnProperty(cur) ? words[cur] : null;
            return xType;
        }

        function tokenString(quote) {
            return function (stream, state) {
                var next, end = false, escaped = false;
                while ((next = stream.next()) != null) {
                    if (next === quote && !escaped) {
                        end = true;
                        break;
                    }
                    escaped = !escaped && next === '\\';
                }
                if (end || !escaped) {
                    state.tokens.shift();
                }
                return (quote === ')' ? 'quote' : 'string');
            };
        }

        function tokenize(stream, state) {
            return (state.tokens[0] || tokenBase)(stream, state);
        }

        return {
            startState: function () {
                return {tokens: []};
            },
            token: function (stream, state) {
                return tokenize(stream, state);
            },
            closeBrackets: "()[]{}''\"\"",
            lineComment: '*',
            fold: "comment"
        };
    });

    CodeMirror.defineMIME('text/mvbasic', 'mvbasic');

});