Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex.default : ex;
}

const React = require('react');
const React__default = _interopDefault(React);
const polished = require('polished');

function createCommonjsModule$1(fn, module) {
  return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

const stylis = createCommonjsModule$1((module, exports) => {
  /*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * light - weight css preprocessor @licence MIT
 */
  /* eslint-disable */
  (function(factory) {
    module['exports'] = factory();
  })(function() {
    'use strict';
    /**
	 * Notes
	 *
	 * int + int + int === n4 [faster]
	 *
	 * vs
	 *
	 * int === n1 && int === n2 && int === n3
	 *
	 * ----
	 *
	 * switch (int) { case ints...} [faster]
	 *
	 * vs
	 *
	 * if (int == 1 && int === 2 ...)
	 *
	 * ----
	 *
	 * The (first*n1 + second*n2 + third*n3) format used in the property parser
	 * is a simple way to hash the sequence of characters
	 * taking into account the index they occur in
	 * since any number of 3 character sequences could produce duplicates.
	 *
	 * On the other hand sequences that are directly tied to the index of the character
	 * resolve a far more accurate measure, it's also faster
	 * to evaluate one condition in a switch statement
	 * than three regardless of the added math
	 *
	 * This allows the property parser to in theory be both small and fast.
	 */

    var nulptn = /^\0+/g; /* matches leading null characters */
    var fmtptn = /[\0\r]/g; /* new line and null characters */
    var colonptn = /: */g; /* splits animation rules */
    var cursorptn = /zoo|gra/; /* assert cursor varient */
    var transformptn = / *(transform)/g; /* vendor prefix transform, older webkit */
    var animationptn = /,+\s*(?![^(]*[)])/g; /* splits multiple shorthand notation animations */
    var propertiesbtn = / +\s*(?![^(]*[)])/g; /* animation properties */
    var elementptn = / *[\0] */g; /* selector elements */
    var selectorptn = /,\r+?/g; /* splits selectors */
    var andptn = /&/g; /* match & */
    var keyptn = /\W+/g; /* removes invalid characters from key */
    var escapeptn = /:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g; /* matches :global(.*) */
    var keyframeptn = /@(k\w+s)\s*(\S*)\s*/; /* matches @keyframes $1 */
    var plcholdrptn = /::?(place)/g; /* match ::placeholder varient */
    var beforeptn = /\s+(?=[{\];=:>])/g; /* rm \s before ] ; = : */
    var afterptn = /([[}=:>])\s+/g; /* rm \s after characters [ } = : */
    var tailptn = /(\{[^{]+?);(?=\})/g; /* rm tail semi-colons ;} */
    var whiteptn = /\s{2,}/g;
    var pseudoptn = /([^\(])(:+) */g; /* pseudo element */

    /* vendors */
    var webkit = '-webkit-';
    var moz = '-moz-';
    var ms = '-ms-';

    /* character codes */
    var SEMICOLON = 59; /* ; */
    var CLOSEBRACES = 125; /* } */
    var OPENBRACES = 123; /* { */
    var OPENPARENTHESES = 40; /* ( */
    var CLOSEPARENTHESES = 41; /* ) */
    var OPENBRACKET = 91; /* [ */
    var CLOSEBRACKET = 93; /* ] */
    var NEWLINE = 10; /* \n */
    var CARRIAGE = 13; /* \r */
    var TAB = 9; /* \t */
    var AT = 64; /* @ */
    var SPACE = 32; /*   */
    var AND = 38; /* & */
    var DASH = 45; /* - */
    var UNDERSCORE = 95; /* _ */
    var STAR = 42; /* * */
    var COMMA = 44; /* , */
    var COLON = 58; /* : */
    var SINGLEQUOTE = 39; /* ' */
    var DOUBLEQUOTE = 34; /* " */
    var FOWARDSLASH = 47; /* / */
    var GREATERTHAN = 62; /* > */
    var PLUS = 43; /* + */
    var TILDE = 126; /* ~ */
    var NULL = 0; /* \0 */
    var FORMFEED = 12; /* \f */
    var VERTICALTAB = 11; /* \v */

    /* special identifiers */
    var KEYFRAME = 107; /* k */
    var MEDIA = 109; /* m */
    var SUPPORTS = 115; /* s */
    var FONT = 102; /* f */
    var PLACEHOLDER = 112; /* p */
    var IMPORT = 169; /* <at>i */
    var CHARSET = 163; /* <at>c */

    var column = 1; /* current column */
    var line = 1; /* current line numebr */
    var pattern = 0; /* :pattern */

    var cascade = 1; /* #id h1 h2 vs h1#id h2#id  */
    var vendor = 1; /* vendor prefix */
    var escape = 1; /* escape :global() pattern */
    var compress = 0; /* compress output */
    var semicolon = 0; /* no/semicolon option */

    /* empty reference */
    var array = [];

    /* plugins */
    var plugins = [];
    var plugged = 0;

    /* plugin context */
    var POSTS = -2;
    var PREPS = -1;
    var UNKWN = 0;
    var PROPS = 1;
    var BLCKS = 2;
    var ATRUL = 3;

    var unkwn = 0;

    /* keyframe animation */
    var keyed = 1;
    var key = '';

    /* selector namespace */
    var nscopealt = '';
    var nscope = '';

    /**
	 * Compile
	 *
	 * @param {Array<string>} parent
	 * @param {Array<string>} current
	 * @param {string} body
	 * @param {number} from
	 * @return {string}
	 */
    function compile(parent, current, body, from) {
      var brq = 0; /* brackets [] */
      var cmt = 0; /* comments /* // or /* */
      var fnq = 0; /* functions () */
      var str = 0; /* quotes '', "" */
      var first = 0;
      var second = 0;
      var counter = 0;
      var context = 0;
      var atrule = 0;
      var pseudo = 0;
      var caret = 0;
      var code = 0;
      var tail = 0;
      var trail = 0;
      var fmt = 0;
      var insert = 0;
      var length = 0;
      var eof = body.length;
      var eol = eof - 1;
      var char = '';
      var chars = '';
      var out = '';
      var block = '';
      var children = '';
      var flat = '';
      var ref;
      var res;

      // ...build body
      while (caret < eof) {
        code = body.charCodeAt(caret);

        if (cmt + str + fnq + brq === 0) {
          // auto semicolon insertion
          if (insert === 1) {
            // false flags, comma character
            switch (code) {
              case COMMA: {
                break;
              }
              default: {
                caret--;
                code = SEMICOLON;
              }
            }

            insert = 0;
          }

          // eof varient
          switch (caret) {
            case eol: {
              if (fmt > 0) {
                chars = chars.replace(fmtptn, '');
              }

              if ((chars = chars.trim()).length > 0) {
                switch (code) {
                  case SPACE:
                  case TAB:
                  case SEMICOLON:
                  case CARRIAGE:
                  case NEWLINE: {
                    break;
                  }
                  default: {
                    chars += body.charAt(caret);
                  }
                }

                code = SEMICOLON;
              }
            }
          }

          // token varient
          switch (code) {
            case OPENBRACES: {
              chars = chars.trim();
              first = chars.charCodeAt(0);
              counter = 1;
              caret++;

              while (caret < eof) {
                code = body.charCodeAt(caret);

                switch (code) {
                  case OPENBRACES: {
                    counter++;
                    break;
                  }
                  case CLOSEBRACES: {
                    counter--;
                    break;
                  }
                }

                if (counter === 0) {
                  break;
                }

                block += body.charAt(caret++);
              }

              if (first === NULL) {
                first = (chars = chars.replace(nulptn, '').trim()).charCodeAt(
                  0
                );
              }

              switch (first) {
                // @at-rule
                case AT: {
                  if (fmt > 0) {
                    chars = chars.replace(fmtptn, '');
                  }

                  second = chars.charCodeAt(1);
                  block = compile(
                    current,
                    second > 108 ? current : array,
                    block,
                    second
                  );

                  // execute plugins, @at-rule context
                  if (plugged > 0) {
                    ref = select(array, chars);
                    res = proxy(
                      ATRUL,
                      block,
                      ref,
                      current,
                      line,
                      column,
                      out.length
                    );
                    chars = ref.join('');

                    if (res !== void 0) {
                      block = res;
                    }
                  }

                  switch (second) {
                    case MEDIA:
                    case SUPPORTS: {
                      block = chars + '{' + block + '}';
                      break;
                    }
                    case FONT: {
                      block = chars + block;
                      break;
                    }
                    case KEYFRAME: {
                      chars = chars.replace(
                        keyframeptn,
                        '$1 $2' + (keyed > 0 ? key : '')
                      );
                      block = chars + '{' + block + '}';
                      block =
                        '@' +
                        (vendor > 0 ? webkit + block + '@' + block : block);
                      break;
                    }
                  }
                  break;
                }
                // selector
                default: {
                  block = compile(current, select(current, chars), block, from);
                }
              }

              children += block;
              caret++;

              // reset
              context = 0;
              pseudo = 0;
              fmt = 0;
              atrule = 0;
              chars = '';
              block = '';

              break;
            }
            case SEMICOLON: {
              if (fmt > 0) {
                chars = chars.replace(fmtptn, '');
              }

              chars = chars.trim();

              // execute plugins, property context
              if (plugged > 0) {
                if (
                  (res = proxy(
                    PROPS,
                    chars,
                    current,
                    parent,
                    line,
                    column,
                    out.length
                  )) !== void 0
                ) {
                  if ((chars = res.trim()).length < 1) {
                    chars = '\0\0';
                  }
                }
              }

              first = chars.charCodeAt(0);
              second = chars.charCodeAt(1);

              switch (first + second) {
                case NULL: {
                  break;
                }
                case IMPORT:
                case CHARSET: {
                  flat += chars + body.charAt(caret);
                  break;
                }
                default: {
                  out += property(chars, first, second, chars.charCodeAt(2));
                }
              }

              caret++;

              // reset
              context = 0;
              pseudo = 0;
              fmt = 0;
              chars = '';

              break;
            }
          }
        }

        // parse characters
        switch (code) {
          case CARRIAGE:
          case NEWLINE: {
            // auto insert semicolon
            if (cmt + str + fnq + brq + semicolon === 0) {
              // valid characters that
              // may precede a newline
              switch (tail) {
                case COLON:
                case COMMA:
                case NULL:
                case TAB:
                case CARRIAGE:
                case NEWLINE:
                case SPACE:
                case SEMICOLON:
                case OPENBRACES:
                case CLOSEBRACES: {
                  break;
                }
                default: {
                  // colon : present? register for auto semicolon insertion
                  if (pseudo > 0) {
                    insert = 1;
                  }
                }
              }
            }

            // terminate line comment
            if (cmt === FOWARDSLASH) {
              cmt = 0;
            }

            // execute plugins, newline context
            if (plugged * unkwn > 0) {
              proxy(UNKWN, chars, current, parent, line, column, out.length);
            }

            // next line, reset column position
            column = 1;
            line++;

            break;
          }
          default: {
            // increment column position
            column++;

            // ignore tabs
            if (code === TAB) {
              break;
            }

            // current character
            char = body.charAt(caret);

            // remove comments, escape functions, strings, attributes and prepare selectors
            switch (code) {
              // escape breaking control characters
              case NULL:
                char = '\\0';
                break;
              case FORMFEED:
                char = '\\f';
                break;
              case VERTICALTAB:
                char = '\\v';
                break;
              // :p<l>aceholder
              // :g<l>obal
              case 108: {
                if (
                  str + cmt + brq + pattern === 0 &&
                  pseudo > 0 &&
                  caret - pseudo === 2
                ) {
                  if (
                    tail !== PLACEHOLDER ||
                    body.charCodeAt(caret - 3) === COLON
                  ) {
                    pattern = tail;
                  }
                }
                break;
              }
              // :pattern
              case COLON: {
                if (str + cmt + brq === 0) {
                  pseudo = caret;
                }
                break;
              }
              // selectors
              case COMMA: {
                if (cmt + fnq + str + brq === 0) {
                  fmt = 1;
                  char += '\r';
                }
                break;
              }
              // qoutes
              case DOUBLEQUOTE: {
                if (cmt === 0) {
                  str = str === DOUBLEQUOTE ? 0 : str === 0 ? DOUBLEQUOTE : str;
                }
                break;
              }
              case SINGLEQUOTE: {
                if (cmt === 0) {
                  str = str === SINGLEQUOTE ? 0 : str === 0 ? SINGLEQUOTE : str;
                }
                break;
              }
              // attributes
              case OPENBRACKET: {
                if (str + cmt + fnq === 0) {
                  brq = 1;
                }
                break;
              }
              case CLOSEBRACKET: {
                if (str + cmt + fnq === 0) {
                  brq = 0;
                }
                break;
              }
              // functions
              case CLOSEPARENTHESES: {
                if (str + cmt + brq === 0) {
                  // last character, eof
                  if (caret === eol) {
                    eol++;
                    eof++;
                  }
                  fnq--;
                }
                break;
              }
              case OPENPARENTHESES: {
                if (str + cmt + brq === 0) {
                  if (context === 0) {
                    switch (tail * 2 + trail * 3) {
                      // :matches
                      case 533: {
                        break;
                      }
                      // :global, :not, :nth-child etc...
                      default: {
                        counter = 0;
                        context = 1;
                      }
                    }
                  }
                  fnq++;
                }
                break;
              }
              case AT: {
                if (cmt + fnq + str + brq + pseudo + atrule === 0) {
                  atrule = 1;
                }
                break;
              }
              // block/line comments
              case STAR:
              case FOWARDSLASH: {
                if (str + brq + fnq > 0) {
                  break;
                }

                switch (cmt) {
                  case 0: {
                    switch (code * 2 + body.charCodeAt(caret + 1) * 3) {
                      // //
                      case 235: {
                        cmt = FOWARDSLASH;
                        break;
                      }
                      // /*
                      case 220: {
                        cmt = STAR;
                        break;
                      }
                    }
                    break;
                  }
                  case STAR: {
                    if (code === FOWARDSLASH && tail === STAR) {
                      char = '';
                      cmt = 0;
                    }
                  }
                }
              }
            }

            // ignore comment blocks
            if (cmt === 0) {
              // aggressive isolation mode, divide each individual selector
              // including selectors in :not function but excluding selectors in :global function
              if (cascade + str + brq + atrule === 0 && from !== KEYFRAME) {
                switch (((fmt = 1), code)) {
                  case COMMA:
                  case TILDE:
                  case GREATERTHAN:
                  case PLUS:
                  case CLOSEPARENTHESES:
                  case OPENPARENTHESES: {
                    if (context === 0) {
                      switch (tail) {
                        case TAB:
                        case SPACE:
                        case NEWLINE:
                        case CARRIAGE: {
                          char = char + '\0';
                          break;
                        }
                        default: {
                          char = '\0' + char + (code === COMMA ? '' : '\0');
                        }
                      }
                    } else {
                      switch (code) {
                        case OPENPARENTHESES: {
                          context = ++counter;
                          break;
                        }
                        case CLOSEPARENTHESES: {
                          if ((context = --counter) === 0) {
                            char += '\0';
                          }
                          break;
                        }
                      }
                    }
                    break;
                  }
                  case SPACE: {
                    switch (tail) {
                      case COMMA:
                      case TAB:
                      case SPACE:
                      case NEWLINE:
                      case CARRIAGE: {
                        break;
                      }
                      default: {
                        if (context === 0) {
                          char += '\0';
                        }
                      }
                    }
                  }
                }
              }

              // concat buffer of characters
              chars += char;
            }
          }
        }

        // tail characters
        trail = tail;
        tail = code;

        // visit every character
        caret++;
      }

      if (fmt > 0) {
        out = out.replace(fmtptn, '');
      }

      length = out.length;

      // execute plugins, block context
      if (length > 0 && plugged > 0) {
        res = proxy(BLCKS, out, current, parent, line, column, length);

        if (res !== void 0) {
          length = (out = res).length;
        }
      }

      if (length > 0) {
        if (cascade === 0 && from !== KEYFRAME) {
          isolate(current);
        }

        out = current.join(',').trim() + '{' + out + '}';

        switch (pattern) {
          case 0: {
            break;
          }
          case PLACEHOLDER: {
            // :placeholder
            out =
              out.replace(plcholdrptn, '::' + webkit + 'input-$1') +
              out.replace(plcholdrptn, '::' + moz + '$1') +
              out.replace(plcholdrptn, ':' + ms + 'input-$1') +
              out;
          }
          default: {
            pattern = 0;
          }
        }
      }

      return flat + out + children;
    }

    /**
	 * Select
	 *
	 * @param {Array<string>} parent
	 * @param {string} current
	 * @return {Array<string>}
	 */
    function select(parent, current) {
      var selectors = current.trim().split(selectorptn);
      var out = selectors;

      var length = out.length;
      var l = parent.length;

      switch (l) {
        case 0:
        case 1: {
          for (
            var i = 0, ref = l === 0 ? '' : parent[0] + ' ';
            i < length;
            i++
          ) {
            out[i] = scope(out[i], ref, l).trim();
          }
          break;
        }
        // nested
        default: {
          for (var i = 0, j = 0, out = []; i < length; i++) {
            for (var k = 0; k < l; k++) {
              out[j++] = scope(selectors[i], parent[k] + ' ', l).trim();
            }
          }
        }
      }

      return out;
    }

    /**
	 * Scope
	 *
	 * @param {string} input
	 * @param {string} parent
	 * @param {number} level
	 * @return {string}
	 */
    function scope(input, parent, level) {
      var selector = input;
      var prefix = parent;
      var code = selector.charCodeAt(0);

      // trim leading whitespace
      if (code < 33) {
        code = (selector = selector.trim()).charCodeAt(0);
      }

      switch (code) {
        // &
        case AND: {
          switch (cascade + level) {
            case 0:
            case 1: {
              if (parent.trim().length === 0) {
                break;
              }
            }
            default: {
              return selector.replace(andptn, prefix.trim());
            }
          }
          break;
        }
        // :
        case COLON: {
          switch (selector.charCodeAt(1)) {
            // g in :global
            case 103: {
              if (escape > 0 && cascade > 0) {
                return selector
                  .replace(escapeptn, '$1')
                  .replace(andptn, nscope);
              }
              break;
            }
            default: {
              // :hover
              return prefix.trim() + selector;
            }
          }
        }
        default: {
          switch (selector.charCodeAt(selector.length - 1)) {
            // html &
            case AND: {
              return (
                prefix.replace(nscope, '').trim() +
                ' ' +
                selector.replace(andptn, nscope)
              );
            }
          }
        }
      }

      return prefix + selector;
    }

    /**
	 * Property
	 *
	 * @param {string} input
	 * @param {number} first
	 * @param {number} second
	 * @param {number} third
	 * @return {string}
	 */
    function property(input, first, second, third) {
      var out = input + ';';
      var index = 0;
      var hash = first * 2 + second * 3 + third * 4;
      var cache;

      // animation: a, n, i characters
      if (hash === 944) {
        out = animation(out);
      } else if (vendor > 0) {
        // vendor prefix
        switch (hash) {
          // background/backface-visibility, b, a, c
          case 883: {
            // backface-visibility, -
            if (out.charCodeAt(8) === DASH) {
              out = webkit + out + out;
            }
            break;
          }
          // appearance: a, p, p
          case 978: {
            out = webkit + out + moz + out + out;
            break;
          }
          // hyphens: h, y, p
          // user-select: u, s, e
          case 1019:
          case 983: {
            out = webkit + out + moz + out + ms + out + out;
            break;
          }
          // flex: f, l, e
          case 932: {
            out = webkit + out + ms + out + out;
            break;
          }
          case 964: {
            // order: o, r, d
            out = webkit + out + ms + 'flex' + '-' + out + out;
            break;
          }
          // justify-content, j, u, s
          case 1023: {
            cache = out.substring(out.indexOf(':', 15)).replace('flex-', '');
            out =
              webkit +
              'box-pack' +
              cache +
              webkit +
              out +
              ms +
              'flex-pack' +
              cache +
              out;
            break;
          }
          // display(flex/inline-flex/inline-box): d, i, s
          case 975: {
            index = (out = input).length - 10;
            cache = (out.charCodeAt(index) === 33
              ? out.substring(0, index)
              : out)
              .substring(8)
              .trim();

            switch ((hash = cache.charCodeAt(0) + (cache.charCodeAt(7) | 0))) {
              // inline-
              case 203: {
                // inline-box
                if (cache.charCodeAt(8) > 110) {
                  out = out.replace(cache, webkit + cache) + ';' + out;
                }
                break;
              }
              // inline-flex
              // flex
              case 207:
              case 102: {
                out =
                  out.replace(
                    cache,
                    webkit + (hash > 102 ? 'inline-' : '') + 'box'
                  ) +
                  ';' +
                  out.replace(cache, webkit + cache) +
                  ';' +
                  out.replace(cache, ms + cache + 'box') +
                  ';' +
                  out;
              }
            }

            out += ';';
            break;
          }
          // align-items, align-center, align-self: a, l, i, -
          case 938: {
            if (out.charCodeAt(5) === DASH) {
              switch (out.charCodeAt(6)) {
                // align-items, i
                case 105: {
                  cache = out.replace('-items', '');
                  out =
                    webkit +
                    out +
                    webkit +
                    'box-' +
                    cache +
                    ms +
                    'flex-' +
                    cache +
                    out;
                  break;
                }
                // align-self, s
                case 115: {
                  out =
                    webkit +
                    out +
                    ms +
                    'flex-item-' +
                    out.replace('-self', '') +
                    out;
                  break;
                }
                // align-content
                default: {
                  out =
                    webkit +
                    out +
                    ms +
                    'flex-line-pack' +
                    out.replace('align-content', '') +
                    out;
                }
              }
            }
            break;
          }
          // cursor, c, u, r
          case 1005: {
            if (cursorptn.test(out)) {
              out =
                out.replace(colonptn, ': ' + webkit) +
                out.replace(colonptn, ': ' + moz) +
                out;
            }
            break;
          }
          // width: min-content / width: max-content
          case 953: {
            if ((index = out.indexOf('-content', 9)) > 0) {
              // width: min-content / width: max-content
              cache = out.substring(index - 3);
              out =
                'width:' +
                webkit +
                cache +
                'width:' +
                moz +
                cache +
                'width:' +
                cache;
            }
            break;
          }
          // transform, transition: t, r, a
          // text-size-adjust: t, e, x
          case 962:
          case 1015: {
            out =
              webkit + out + (out.charCodeAt(5) === 102 ? ms + out : '') + out;

            // transitions
            if (
              second + third === 211 &&
              out.charCodeAt(13) === 105 &&
              out.indexOf('transform', 10) > 0
            ) {
              out =
                out
                  .substring(0, out.indexOf(';', 27) + 1)
                  .replace(transformptn, webkit + '$1') + out;
            }

            break;
          }
        }
      }

      return out;
    }

    /**
	 * Animation
	 *
	 * @param {string} input
	 * @return {string}
	 */
    function animation(input) {
      var length = input.length;
      var index = input.indexOf(':', 9) + 1;
      var declare = input.substring(0, index).trim();
      var body = input.substring(index, length - 1).trim();
      var out = '';

      // shorthand
      if (input.charCodeAt(9) !== DASH) {
        var list = body.split(animationptn);

        for (
          var i = 0, index = 0, length = list.length;
          i < length;
          index = 0, i++
        ) {
          var value = list[i];
          var items = value.split(propertiesbtn);

          while ((value = items[index])) {
            var peak = value.charCodeAt(0);

            if (
              keyed === 1 &&
              // letters
              ((peak > AT && peak < 90) ||
                (peak > 96 && peak < 122) ||
                peak === UNDERSCORE ||
                // dash but not in sequence ex. --
                (peak === DASH && value.charCodeAt(1) !== DASH))
            ) {
              // not a number/function
              switch (isNaN(parseFloat(value)) + (value.indexOf('(') !== -1)) {
                case 1: {
                  switch (value) {
                    case 'infinite':
                    case 'alternate':
                    case 'backwards':
                    case 'running':
                    case 'normal':
                    case 'forwards':
                    case 'both':
                    case 'none':
                    case 'linear':
                    case 'ease':
                    case 'ease-in':
                    case 'ease-out':
                    case 'ease-in-out':
                    case 'paused':
                    case 'reversed':
                    case 'alternate-reverse':
                    case 'inherit':
                    case 'initial':
                    case 'unset':
                    case 'step-start':
                    case 'step-end': {
                      break;
                    }
                    default: {
                      value += key;
                    }
                  }
                }
              }
            }

            items[index++] = value;
          }

          out += (i === 0 ? '' : ',') + items.join(' ');
        }
      } else {
        out += input.charCodeAt(10) === 110
          ? body + (keyed === 1 ? key : '')
          : body;
      }

      out = declare + out + ';';

      return vendor > 0 ? webkit + out + out : out;
    }

    /**
	 * Isolate
	 *
	 * @param {Array<string>} selectors
	 */
    function isolate(selectors) {
      for (
        var i = 0, length = selectors.length, prefix, element;
        i < length;
        i++
      ) {
        var elements = selectors[i].split(elementptn);
        var out = '';

        for (
          var j = 0, size = 0, tail = 0, code = 0, l = elements.length;
          j < l;
          j++
        ) {
          if ((size = (element = elements[j]).length) === 0 && l > 1) {
            continue;
          }

          prefix = ' ';
          tail = out.charCodeAt(out.length - 1);
          code = element.charCodeAt(0);

          if (j === 0) {
            prefix = '';
          } else {
            switch (tail) {
              case STAR:
              case TILDE:
              case GREATERTHAN:
              case PLUS:
              case SPACE:
              case OPENPARENTHESES: {
                prefix = '';
              }
            }
          }

          switch (code) {
            case AND: {
              element = prefix + '' + nscopealt;
            }
            case TILDE:
            case GREATERTHAN:
            case PLUS:
            case SPACE:
            case CLOSEPARENTHESES:
            case OPENPARENTHESES: {
              break;
            }
            case OPENBRACKET: {
              element = prefix + element + nscopealt;
              break;
            }
            case COLON: {
              switch (element.charCodeAt(1) * 2 + element.charCodeAt(2) * 3) {
                // :global
                case 530: {
                  if (escape > 0) {
                    element = prefix + element.substring(8, size - 1);
                    break;
                  }
                }
                // :hover, :nth-child(), ...
                default: {
                  if (j < 1 || elements[j - 1].length < 1) {
                    element = prefix + nscopealt + element;
                  }
                }
              }
              break;
            }
            case COMMA: {
              prefix = '';
            }
            default: {
              if (size > 1 && element.indexOf(':') > 0) {
                element =
                  prefix + element.replace(pseudoptn, '$1' + nscopealt + '$2');
              } else {
                element = prefix + element + nscopealt;
              }
            }
          }

          out += element;
        }

        selectors[i] = out.replace(fmtptn, '').trim();
      }
    }

    /**
	 * Proxy
	 *
	 * @param {number} context
	 * @param {string} content
	 * @param {Array<string>} selectors
	 * @param {Array<string>} parents
	 * @param {number} line
	 * @param {number} column
	 * @param {number} length
	 * @return {(string|void|*)}
	 */
    function proxy(context, content, selectors, parents, line, column, length) {
      for (var i = 0, out = content, next; i < plugged; i++) {
        switch ((next = plugins[i].call(
          stylis,
          context,
          out,
          selectors,
          parents,
          line,
          column,
          length
        ))) {
          case void 0:
          case false:
          case true:
          case null: {
            break;
          }
          default: {
            out = next;
          }
        }
      }

      switch (out) {
        case void 0:
        case false:
        case true:
        case null:
        case content: {
          break;
        }
        default: {
          return out;
        }
      }
    }

    /**
	 * Minify
	 *
	 * @param {(string|*)} output
	 * @return {string}
	 */
    function minify(output) {
      return output
        .replace(fmtptn, '')
        .replace(beforeptn, '')
        .replace(afterptn, '$1')
        .replace(tailptn, '$1')
        .replace(whiteptn, ' ');
    }

    /**
	 * Use
	 *
	 * @param {(Array<function(...?)>|function(...?)|number|void)?} plugin
	 */
    function use(plugin) {
      switch (plugin) {
        case void 0:
        case null: {
          plugged = plugins.length = 0;
          break;
        }
        default: {
          switch (plugin.constructor) {
            case Array: {
              for (var i = 0, length = plugin.length; i < length; i++) {
                use(plugin[i]);
              }
              break;
            }
            case Function: {
              plugins[plugged++] = plugin;
              break;
            }
            case Boolean: {
              unkwn = !!plugin | 0;
            }
          }
        }
      }

      return use;
    }

    /**
	 * Set
	 *
	 * @param {Object} options
	 */
    function set(options) {
      for (var name in options) {
        var value = options[name];
        switch (name) {
          case 'keyframe':
            keyed = value | 0;
            break;
          case 'global':
            escape = value | 0;
            break;
          case 'cascade':
            cascade = value | 0;
            break;
          case 'compress':
            compress = value | 0;
            break;
          case 'prefix':
            vendor = value | 0;
            break;
          case 'semicolon':
            semicolon = value | 0;
            break;
        }
      }

      return set;
    }

    /**
	 * Stylis
	 *
	 * @param {string} selector
	 * @param {string} input
	 * @return {(string|*)}
	 */
    function stylis(selector, input) {
      // setup
      var ns = selector;
      var code = ns.charCodeAt(0);

      // trim leading whitespace
      if (code < 33) {
        code = (ns = ns.trim()).charCodeAt(0);
      }

      // keyframe/animation namespace
      if (keyed > 0) {
        key = ns.replace(keyptn, code === OPENBRACKET ? '' : '-');
      }

      // bit
      code = 1;

      // cascade/isolate
      if (cascade === 1) {
        nscope = ns;
      } else {
        nscopealt = ns;
      }

      var selectors = [nscope];

      // execute plugins, pre-process context
      if (plugged > 0) {
        proxy(PREPS, input, selectors, selectors, line, column, 0);
      }

      // build
      var output = compile(array, selectors, input, 0);

      // execute plugins, post-process context
      if (plugged > 0) {
        var res = proxy(
          POSTS,
          output,
          selectors,
          selectors,
          line,
          column,
          output.length
        );

        if (res !== void 0) {
          // bypass minification
          if (typeof (output = res) !== 'string') {
            code = 0;
          }
        }
      }

      // reset
      key = '';
      nscope = '';
      nscopealt = '';
      pattern = 0;
      line = 1;
      column = 1;

      return compress * code === 0 ? output : minify(output);
    }

    stylis['use'] = use;
    stylis['set'] = set;

    return stylis;
  });
});

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate$2(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

var hyphenate_1 = hyphenate$2;

var hyphenate = hyphenate_1;

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

var hyphenateStyleName_1 = hyphenateStyleName;

var _typeof = typeof Symbol === 'function' &&
  typeof Symbol.iterator === 'symbol'
  ? function(obj) {
      return typeof obj;
    }
  : function(obj) {
      return obj &&
        typeof Symbol === 'function' &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? 'symbol'
        : typeof obj;
    };

var classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};

var createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

var inherits = function(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    );
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
};

var objectWithoutProperties = function(obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }

  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
};

/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var index$1 = function isObject(val) {
  return (
    val != null &&
    (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' &&
    !Array.isArray(val)
  );
};

var isObject$1 = index$1;

function isObjectObject(o) {
  return (
    isObject$1(o) === true &&
    Object.prototype.toString.call(o) === '[object Object]'
  );
}

var index = function isPlainObject(o) {
  var ctor, prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};

//
var objToCss = function objToCss(obj, prevKey) {
  var css = Object.keys(obj)
    .map(function(key) {
      if (index(obj[key])) return objToCss(obj[key], key);
      return hyphenateStyleName_1(key) + ': ' + obj[key] + ';';
    })
    .join(' ');
  return prevKey ? prevKey + ' {\n  ' + css + '\n}' : css;
};

var flatten = function flatten(chunks, executionContext) {
  return chunks.reduce(function(ruleSet, chunk) {
    /* Remove falsey values */
    if (
      chunk === undefined ||
      chunk === null ||
      chunk === false ||
      chunk === ''
    )
      return ruleSet;
    /* Flatten ruleSet */
    if (Array.isArray(chunk))
      return [].concat(ruleSet, flatten(chunk, executionContext));

    /* Handle other components */
    // $FlowFixMe not sure how to make this pass
    if (chunk.hasOwnProperty('styledComponentId'))
      return [].concat(ruleSet, ['.' + chunk.styledComponentId]);

    /* Either execute or defer the function */
    if (typeof chunk === 'function') {
      return executionContext
        ? ruleSet.concat.apply(
            ruleSet,
            flatten([chunk(executionContext)], executionContext)
          )
        : ruleSet.concat(chunk);
    }

    /* Handle objects */
    // $FlowFixMe have to add %checks somehow to isPlainObject
    return ruleSet.concat(index(chunk) ? objToCss(chunk) : chunk.toString());
  }, []);
};

//
stylis.set({
  global: false,
  cascade: true,
  keyframe: false,
  prefix: true,
  compress: false,
  semicolon: true
});

var stringifyRules = function stringifyRules(rules, selector, prefix) {
  var flatCSS = rules.join('').replace(/^\s*\/\/.*$/gm, ''); // replace JS comments

  var cssStr = selector && prefix
    ? prefix + ' ' + selector + ' { ' + flatCSS + ' }'
    : flatCSS;

  return stylis(prefix || !selector ? '' : selector, cssStr);
};

//
var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var charsLength = chars.length;

/* Some high number, usually 9-digit base-10. Map it to base-😎 */
var generateAlphabeticName = function generateAlphabeticName(code) {
  var name = '';
  var x = void 0;

  for (x = code; x > charsLength; x = Math.floor(x / chars.length)) {
    name = chars[x % charsLength] + name;
  }

  return chars[x % charsLength] + name;
};

//

var interleave = function(strings, interpolations) {
  return interpolations.reduce(
    function(array, interp, i) {
      return array.concat(interp, strings[i + 1]);
    },
    [strings[0]]
  );
};

//
var css = function(strings) {
  for (
    var _len = arguments.length,
      interpolations = Array(_len > 1 ? _len - 1 : 0),
      _key = 1;
    _key < _len;
    _key++
  ) {
    interpolations[_key - 1] = arguments[_key];
  }

  return flatten(interleave(strings, interpolations));
};

//
var SC_COMPONENT_ID = /^[^\S\n]*?\/\* sc-component-id:\s+(\S+)\s+\*\//gm;

var extractCompsFromCSS = function(maybeCSS) {
  var css = '' + (maybeCSS || ''); // Definitely a string, and a clone
  var existingComponents = [];
  css.replace(SC_COMPONENT_ID, function(match, componentId, matchIndex) {
    existingComponents.push({
      componentId: componentId,
      matchIndex: matchIndex
    });
    return match;
  });
  return existingComponents.map(function(_ref, i) {
    var componentId = _ref.componentId,
      matchIndex = _ref.matchIndex;

    var nextComp = existingComponents[i + 1];
    var cssFromDOM = nextComp
      ? css.slice(matchIndex, nextComp.matchIndex)
      : css.slice(matchIndex);
    return { componentId: componentId, cssFromDOM: cssFromDOM };
  });
};

//
/*
 * Browser Style Sheet with Rehydration
 *
 * <style data-styled-components="x y z"
 *        data-styled-components-is-local="true">
 *   /· sc-component-id: a ·/
 *   .sc-a { ... }
 *   .x { ... }
 *   /· sc-component-id: b ·/
 *   .sc-b { ... }
 *   .y { ... }
 *   .z { ... }
 * </style>
 *
 * Note: replace · with * in the above snippet.
 * */
var COMPONENTS_PER_TAG = 40;

var BrowserTag = (function() {
  function BrowserTag(el, isLocal) {
    var existingSource = arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : '';
    classCallCheck(this, BrowserTag);

    this.el = el;
    this.isLocal = isLocal;
    this.ready = false;

    var extractedComps = extractCompsFromCSS(existingSource);

    this.size = extractedComps.length;
    this.components = extractedComps.reduce(function(acc, obj) {
      acc[obj.componentId] = obj; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  }

  BrowserTag.prototype.isFull = function isFull() {
    return this.size >= COMPONENTS_PER_TAG;
  };

  BrowserTag.prototype.addComponent = function addComponent(componentId) {
    if (!this.ready) this.replaceElement();
    if (this.components[componentId])
      throw new Error("Trying to add Component '" + componentId + "' twice!");

    var comp = {
      componentId: componentId,
      textNode: document.createTextNode('')
    };
    this.el.appendChild(comp.textNode);

    this.size += 1;
    this.components[componentId] = comp;
  };

  BrowserTag.prototype.inject = function inject(componentId, css, name) {
    if (!this.ready) this.replaceElement();
    var comp = this.components[componentId];

    if (!comp)
      throw new Error(
        'Must add a new component before you can inject css into it'
      );
    if (comp.textNode.data === '')
      comp.textNode.appendData(
        '\n/* sc-component-id: ' + componentId + ' */\n'
      );

    comp.textNode.appendData(css);
    if (name) {
      var existingNames = this.el.getAttribute(SC_ATTR);
      this.el.setAttribute(
        SC_ATTR,
        existingNames ? existingNames + ' ' + name : name
      );
    }
  };

  BrowserTag.prototype.toHTML = function toHTML() {
    return this.el.outerHTML;
  };

  BrowserTag.prototype.toReactElement = function toReactElement() {
    throw new Error("BrowserTag doesn't implement toReactElement!");
  };

  BrowserTag.prototype.clone = function clone() {
    throw new Error('BrowserTag cannot be cloned!');
  };

  /* Because we care about source order, before we can inject anything we need to
   * create a text node for each component and replace the existing CSS. */

  BrowserTag.prototype.replaceElement = function replaceElement() {
    var _this = this;

    this.ready = true;
    // We have nothing to inject. Use the current el.
    if (this.size === 0) return;

    // Build up our replacement style tag
    var newEl = this.el.cloneNode();
    newEl.appendChild(document.createTextNode('\n'));

    Object.keys(this.components).forEach(function(key) {
      var comp = _this.components[key];

      // eslint-disable-next-line no-param-reassign
      comp.textNode = document.createTextNode(comp.cssFromDOM);
      newEl.appendChild(comp.textNode);
    });

    if (!this.el.parentNode)
      throw new Error("Trying to replace an element that wasn't mounted!");

    // The ol' switcheroo
    this.el.parentNode.replaceChild(newEl, this.el);
    this.el = newEl;
  };

  return BrowserTag;
})();

/* Factory function to separate DOM operations from logical ones*/

var BrowserStyleSheet = {
  create: function create() {
    var tags = [];
    var names = {};

    /* Construct existing state from DOM */
    var nodes = document.querySelectorAll('[' + SC_ATTR + ']');
    var nodesLength = nodes.length;

    for (var i = 0; i < nodesLength; i += 1) {
      var el = nodes[i];

      tags.push(
        new BrowserTag(el, el.getAttribute(LOCAL_ATTR) === 'true', el.innerHTML)
      );

      var attr = el.getAttribute(SC_ATTR);
      if (attr) {
        attr.trim().split(/\s+/).forEach(function(name) {
          names[name] = true;
        });
      }
    }

    /* Factory for making more tags */
    var tagConstructor = function tagConstructor(isLocal) {
      var el = document.createElement('style');
      el.type = 'text/css';
      el.setAttribute(SC_ATTR, '');
      el.setAttribute(LOCAL_ATTR, isLocal ? 'true' : 'false');
      if (!document.head) throw new Error('Missing document <head>');
      document.head.appendChild(el);
      return new BrowserTag(el, isLocal);
    };

    return new StyleSheet(tagConstructor, tags, names);
  }
};

//
var SC_ATTR = 'data-styled-components';
var LOCAL_ATTR = 'data-styled-components-is-local';
var CONTEXT_KEY = '__styled-components-stylesheet__';

var instance = null;
// eslint-disable-next-line no-use-before-define
var clones = [];

var StyleSheet = (function() {
  function StyleSheet(tagConstructor) {
    var tags = arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : [];
    var names = arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : {};
    classCallCheck(this, StyleSheet);
    this.hashes = {};
    this.deferredInjections = {};

    this.tagConstructor = tagConstructor;
    this.tags = tags;
    this.names = names;
    this.constructComponentTagMap();
  }

  StyleSheet.prototype.constructComponentTagMap = function constructComponentTagMap() {
    var _this = this;

    this.componentTags = {};

    this.tags.forEach(function(tag) {
      Object.keys(tag.components).forEach(function(componentId) {
        _this.componentTags[componentId] = tag;
      });
    });
  };

  /* Best level of caching—get the name from the hash straight away. */

  StyleSheet.prototype.getName = function getName(hash) {
    return this.hashes[hash.toString()];
  };

  /* Second level of caching—if the name is already in the dom, don't
   * inject anything and record the hash for getName next time. */

  StyleSheet.prototype.alreadyInjected = function alreadyInjected(hash, name) {
    if (!this.names[name]) return false;

    this.hashes[hash.toString()] = name;
    return true;
  };

  /* Third type of caching—don't inject components' componentId twice. */

  StyleSheet.prototype.hasInjectedComponent = function hasInjectedComponent(
    componentId
  ) {
    return !!this.componentTags[componentId];
  };

  StyleSheet.prototype.deferredInject = function deferredInject(
    componentId,
    isLocal,
    css
  ) {
    if (this === instance) {
      clones.forEach(function(clone) {
        clone.deferredInject(componentId, isLocal, css);
      });
    }

    this.getOrCreateTag(componentId, isLocal);
    this.deferredInjections[componentId] = css;
  };

  StyleSheet.prototype.inject = function inject(
    componentId,
    isLocal,
    css,
    hash,
    name
  ) {
    if (this === instance) {
      clones.forEach(function(clone) {
        clone.inject(componentId, isLocal, css);
      });
    }

    var tag = this.getOrCreateTag(componentId, isLocal);

    var deferredInjection = this.deferredInjections[componentId];
    if (deferredInjection) {
      tag.inject(componentId, deferredInjection);
      delete this.deferredInjections[componentId];
    }

    tag.inject(componentId, css, name);

    if (hash && name) {
      this.hashes[hash.toString()] = name;
    }
  };

  StyleSheet.prototype.toHTML = function toHTML() {
    return this.tags
      .map(function(tag) {
        return tag.toHTML();
      })
      .join('');
  };

  StyleSheet.prototype.toReactElements = function toReactElements() {
    return this.tags.map(function(tag, i) {
      return tag.toReactElement('sc-' + i);
    });
  };

  StyleSheet.prototype.getOrCreateTag = function getOrCreateTag(
    componentId,
    isLocal
  ) {
    var existingTag = this.componentTags[componentId];
    if (existingTag) {
      return existingTag;
    }

    var lastTag = this.tags[this.tags.length - 1];
    var componentTag = !lastTag ||
      lastTag.isFull() ||
      lastTag.isLocal !== isLocal
      ? this.createNewTag(isLocal)
      : lastTag;
    this.componentTags[componentId] = componentTag;
    componentTag.addComponent(componentId);
    return componentTag;
  };

  StyleSheet.prototype.createNewTag = function createNewTag(isLocal) {
    var newTag = this.tagConstructor(isLocal);
    this.tags.push(newTag);
    return newTag;
  };

  StyleSheet.reset = function reset(isServer) {
    instance = StyleSheet.create(isServer);
  };

  /* We can make isServer totally implicit once Jest 20 drops and we
   * can change environment on a per-test basis. */

  StyleSheet.create = function create() {
    var isServer = arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : typeof document === 'undefined';

    return (isServer ? ServerStyleSheet : BrowserStyleSheet).create();
  };

  StyleSheet.clone = function clone(oldSheet) {
    var newSheet = new StyleSheet(
      oldSheet.tagConstructor,
      oldSheet.tags.map(function(tag) {
        return tag.clone();
      }),
      _extends({}, oldSheet.names)
    );

    newSheet.hashes = _extends({}, oldSheet.hashes);
    newSheet.deferredInjections = _extends({}, oldSheet.deferredInjections);
    clones.push(newSheet);

    return newSheet;
  };

  createClass(StyleSheet, null, [
    {
      key: 'instance',
      get: function get() {
        return instance || (instance = StyleSheet.create());
      }
    }
  ]);
  return StyleSheet;
})();

function createCommonjsModule(fn, module) {
  return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction$1 = function emptyFunction$1() {};

emptyFunction$1.thatReturns = makeEmptyFunction;
emptyFunction$1.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction$1.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction$1.thatReturnsNull = makeEmptyFunction(null);
emptyFunction$1.thatReturnsThis = function() {
  return this;
};
emptyFunction$1.thatReturnsArgument = function(arg) {
  return arg;
};

var emptyFunction_1 = emptyFunction$1;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

{
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant$1(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++];
        })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

var invariant_1 = invariant$1;

var emptyFunction$2 = emptyFunction_1;

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning$1 = emptyFunction$2;

{
  (function() {
    var printWarning = function printWarning(format) {
      for (
        var _len = arguments.length,
          args = Array(_len > 1 ? _len - 1 : 0),
          _key = 1;
        _key < _len;
        _key++
      ) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message =
        'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning$1 = function warning$1(condition, format) {
      if (format === undefined) {
        throw new Error(
          '`warning(condition, format, ...args)` requires a warning ' +
            'message argument'
        );
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (
          var _len2 = arguments.length,
            args = Array(_len2 > 2 ? _len2 - 2 : 0),
            _key2 = 2;
          _key2 < _len2;
          _key2++
        ) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

var warning_1 = warning$1;

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var ReactPropTypesSecret$1 = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

var ReactPropTypesSecret_1 = ReactPropTypesSecret$1;

{
  var invariant$2 = invariant_1;
  var warning$2 = warning_1;
  var ReactPropTypesSecret$2 = ReactPropTypesSecret_1;
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes$1(
  typeSpecs,
  values,
  location,
  componentName,
  getStack
) {
  {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant$2(
            typeof typeSpecs[typeSpecName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually from ' +
              'React.PropTypes.',
            componentName || 'React class',
            location,
            typeSpecName
          );
          error = typeSpecs[typeSpecName](
            values,
            typeSpecName,
            componentName,
            location,
            null,
            ReactPropTypesSecret$2
          );
        } catch (ex) {
          error = ex;
        }
        warning$2(
          !error || error instanceof Error,
          '%s: type specification of %s `%s` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a %s. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).',
          componentName || 'React class',
          location,
          typeSpecName,
          typeof error === 'undefined' ? 'undefined' : _typeof(error)
        );
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning$2(
            false,
            'Failed %s type: %s%s',
            location,
            error.message,
            stack != null ? stack : ''
          );
        }
      }
    }
  }
}

var checkPropTypes_1 = checkPropTypes$1;

var emptyFunction = emptyFunction_1;
var invariant = invariant_1;
var warning = warning_1;

var ReactPropTypesSecret = ReactPropTypesSecret_1;
var checkPropTypes = checkPropTypes_1;

var factoryWithTypeCheckers = function factoryWithTypeCheckers(
  isValidElement,
  throwOnDirectAccess
) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn =
      maybeIterable &&
      ((ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL]) ||
        maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(
      isRequired,
      props,
      propName,
      componentName,
      location,
      propFullName,
      secret
    ) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
              'Use `PropTypes.checkPropTypes()` to call them. ' +
              'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (
          'development' !== 'production' &&
          typeof console !== 'undefined'
        ) {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
                'function for the `%s` prop on `%s`. This is deprecated ' +
                'and will throw in the standalone `prop-types` package. ' +
                'You may be seeing this warning due to a third-party PropTypes ' +
                'library. See https://fb.me/react-warning-dont-call-proptypes ' +
                'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError(
              'The ' +
                location +
                ' `' +
                propFullName +
                '` is marked as required ' +
                ('in `' + componentName + '`, but its value is `null`.')
            );
          }
          return new PropTypeError(
            'The ' +
              location +
              ' `' +
              propFullName +
              '` is marked as required in ' +
              ('`' + componentName + '`, but its value is `undefined`.')
          );
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(
      props,
      propName,
      componentName,
      location,
      propFullName,
      secret
    ) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              preciseType +
              '` supplied to `' +
              componentName +
              '`, expected ') +
            ('`' + expectedType + '`.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError(
          'Property `' +
            propFullName +
            '` of component `' +
            componentName +
            '` has invalid PropType notation inside arrayOf.'
        );
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              propType +
              '` supplied to `' +
              componentName +
              '`, expected an array.')
        );
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(
          propValue,
          i,
          componentName,
          location,
          propFullName + '[' + i + ']',
          ReactPropTypesSecret
        );
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              propType +
              '` supplied to `' +
              componentName +
              '`, expected a single ReactElement.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              actualClassName +
              '` supplied to `' +
              componentName +
              '`, expected ') +
            ('instance of `' + expectedClassName + '`.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      warning(
        false,
        'Invalid argument supplied to oneOf, expected an instance of array.'
      );
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError(
        'Invalid ' +
          location +
          ' `' +
          propFullName +
          '` of value `' +
          propValue +
          '` ' +
          ('supplied to `' +
            componentName +
            '`, expected one of ' +
            valuesString +
            '.')
      );
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError(
          'Property `' +
            propFullName +
            '` of component `' +
            componentName +
            '` has invalid PropType notation inside objectOf.'
        );
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              propType +
              '` supplied to `' +
              componentName +
              '`, expected an object.')
        );
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(
            propValue,
            key,
            componentName,
            location,
            propFullName + '.' + key,
            ReactPropTypesSecret
          );
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      warning(
        false,
        'Invalid argument supplied to oneOfType, expected an instance of array.'
      );
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (
          checker(
            props,
            propName,
            componentName,
            location,
            propFullName,
            ReactPropTypesSecret
          ) == null
        ) {
          return null;
        }
      }

      return new PropTypeError(
        'Invalid ' +
          location +
          ' `' +
          propFullName +
          '` supplied to ' +
          ('`' + componentName + '`.')
      );
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` supplied to ' +
            ('`' + componentName + '`, expected a ReactNode.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            propType +
            '` ' +
            ('supplied to `' + componentName + '`, expected `object`.')
        );
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(
          propValue,
          key,
          componentName,
          location,
          propFullName + '.' + key,
          ReactPropTypesSecret
        );
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue === 'undefined'
      ? 'undefined'
      : _typeof(propValue)) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue === 'undefined'
      ? 'undefined'
      : _typeof(propValue);
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

var index$3 = createCommonjsModule(function(module) {
  /**
   * Copyright 2013-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   */

  {
    var REACT_ELEMENT_TYPE =
      (typeof Symbol === 'function' &&
        Symbol.for &&
        Symbol.for('react.element')) ||
      0xeac7;

    var isValidElement = function isValidElement(object) {
      return (
        (typeof object === 'undefined' ? 'undefined' : _typeof(object)) ===
          'object' &&
        object !== null &&
        object.$$typeof === REACT_ELEMENT_TYPE
      );
    };

    // By explicitly using `prop-types` you are opting into new development behavior.
    // http://fb.me/prop-types-in-prod
    var throwOnDirectAccess = true;
    module.exports = factoryWithTypeCheckers(
      isValidElement,
      throwOnDirectAccess
    );
  }
});

var _StyleSheetManager$ch;

//
var StyleSheetManager = (function(_Component) {
  inherits(StyleSheetManager, _Component);

  function StyleSheetManager() {
    classCallCheck(this, StyleSheetManager);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  StyleSheetManager.prototype.getChildContext = function getChildContext() {
    var _ref;

    return (_ref = {}), (_ref[CONTEXT_KEY] = this.props.sheet), _ref;
  };

  StyleSheetManager.prototype.render = function render() {
    /* eslint-disable react/prop-types */
    // Flow v0.43.1 will report an error accessing the `children` property,
    // but v0.47.0 will not. It is necessary to use a type cast instead of
    // a "fixme" comment to satisfy both Flow versions.
    return React__default.Children.only(this.props.children);
  };

  return StyleSheetManager;
})(React.Component);

StyleSheetManager.childContextTypes = (
  (_StyleSheetManager$ch = {}),
  (_StyleSheetManager$ch[CONTEXT_KEY] = index$3.instanceOf(
    StyleSheet
  ).isRequired),
  _StyleSheetManager$ch
);

StyleSheetManager.propTypes = {
  sheet: index$3.instanceOf(StyleSheet).isRequired
};

//
var ServerTag = (function() {
  function ServerTag(isLocal) {
    classCallCheck(this, ServerTag);

    this.isLocal = isLocal;
    this.components = {};
    this.size = 0;
    this.names = [];
  }

  ServerTag.prototype.isFull = function isFull() {
    return false;
  };

  ServerTag.prototype.addComponent = function addComponent(componentId) {
    if (this.components[componentId])
      throw new Error("Trying to add Component '" + componentId + "' twice!");
    this.components[componentId] = { componentId: componentId, css: '' };
    this.size += 1;
  };

  ServerTag.prototype.inject = function inject(componentId, css, name) {
    var comp = this.components[componentId];

    if (!comp)
      throw new Error(
        'Must add a new component before you can inject css into it'
      );
    if (comp.css === '')
      comp.css = '/* sc-component-id: ' + componentId + ' */\n';

    comp.css += css.replace(/\n*$/, '\n');

    if (name) this.names.push(name);
  };

  ServerTag.prototype.toHTML = function toHTML() {
    var _this = this;

    var namesAttr = SC_ATTR + '="' + this.names.join(' ') + '"';
    var localAttr = LOCAL_ATTR + '="' + (this.isLocal ? 'true' : 'false') + '"';
    var css = Object.keys(this.components)
      .map(function(key) {
        return _this.components[key].css;
      })
      .join('');

    return (
      '<style type="text/css" ' +
      namesAttr +
      ' ' +
      localAttr +
      '>\n' +
      css +
      '\n</style>'
    );
  };

  ServerTag.prototype.toReactElement = function toReactElement(key) {
    var _attributes,
      _this2 = this;

    var attributes = (
      (_attributes = {}),
      (_attributes[SC_ATTR] = this.names.join(' ')),
      (_attributes[LOCAL_ATTR] = this.isLocal.toString()),
      _attributes
    );
    var css = Object.keys(this.components)
      .map(function(k) {
        return _this2.components[k].css;
      })
      .join('');

    return React__default.createElement(
      'style',
      _extends(
        {
          key: key,
          type: 'text/css'
        },
        attributes,
        {
          dangerouslySetInnerHTML: { __html: css }
        }
      )
    );
  };

  ServerTag.prototype.clone = function clone() {
    var _this3 = this;

    var copy = new ServerTag(this.isLocal);
    copy.names = [].concat(this.names);
    copy.size = this.size;
    copy.components = Object.keys(this.components).reduce(function(acc, key) {
      acc[key] = _extends({}, _this3.components[key]); // eslint-disable-line no-param-reassign
      return acc;
    }, {});

    return copy;
  };

  return ServerTag;
})();

var ServerStyleSheet = (function() {
  function ServerStyleSheet() {
    classCallCheck(this, ServerStyleSheet);

    this.instance = StyleSheet.clone(StyleSheet.instance);
  }

  ServerStyleSheet.prototype.collectStyles = function collectStyles(children) {
    if (this.closed)
      throw new Error("Can't collect styles once you've called getStyleTags!");
    return React__default.createElement(
      StyleSheetManager,
      { sheet: this.instance },
      children
    );
  };

  ServerStyleSheet.prototype.getStyleTags = function getStyleTags() {
    if (!this.closed) {
      clones.splice(clones.indexOf(this.instance), 1);
      this.closed = true;
    }

    return this.instance.toHTML();
  };

  ServerStyleSheet.prototype.getStyleElement = function getStyleElement() {
    if (!this.closed) {
      clones.splice(clones.indexOf(this.instance), 1);
      this.closed = true;
    }

    return this.instance.toReactElements();
  };

  ServerStyleSheet.create = function create() {
    return new StyleSheet(function(isLocal) {
      return new ServerTag(isLocal);
    });
  };

  return ServerStyleSheet;
})();

//

var LIMIT = 200;

var createWarnTooManyClasses = function(displayName) {
  var generatedClasses = {};
  var warningSeen = false;

  return function(className) {
    if (!warningSeen) {
      generatedClasses[className] = true;
      if (Object.keys(generatedClasses).length >= LIMIT) {
        // Unable to find latestRule in test environment.
        /* eslint-disable no-console, prefer-template */
        console.warn(
          'Over ' +
            LIMIT +
            ' classes were generated for component ' +
            displayName +
            '. ' +
            'Consider using style property for frequently changed styles.\n' +
            'Example:\n' +
            '  const StyledComp = styled.div`width: 100%;`\n' +
            '  <StyledComp style={{ background: background }} />'
        );
        warningSeen = true;
        generatedClasses = {};
      }
    }
  };
};

//
/* Trying to avoid the unknown-prop errors on styled components
 by filtering by React's attribute whitelist.
 */

/* Logic copied from ReactDOMUnknownPropertyHook */
var reactProps = {
  children: true,
  dangerouslySetInnerHTML: true,
  key: true,
  ref: true,
  autoFocus: true,
  defaultValue: true,
  valueLink: true,
  defaultChecked: true,
  checkedLink: true,
  innerHTML: true,
  suppressContentEditableWarning: true,
  onFocusIn: true,
  onFocusOut: true,
  className: true,

  /* List copied from https://facebook.github.io/react/docs/events.html */
  onCopy: true,
  onCut: true,
  onPaste: true,
  onCompositionEnd: true,
  onCompositionStart: true,
  onCompositionUpdate: true,
  onKeyDown: true,
  onKeyPress: true,
  onKeyUp: true,
  onFocus: true,
  onBlur: true,
  onChange: true,
  onInput: true,
  onSubmit: true,
  onClick: true,
  onContextMenu: true,
  onDoubleClick: true,
  onDrag: true,
  onDragEnd: true,
  onDragEnter: true,
  onDragExit: true,
  onDragLeave: true,
  onDragOver: true,
  onDragStart: true,
  onDrop: true,
  onMouseDown: true,
  onMouseEnter: true,
  onMouseLeave: true,
  onMouseMove: true,
  onMouseOut: true,
  onMouseOver: true,
  onMouseUp: true,
  onSelect: true,
  onTouchCancel: true,
  onTouchEnd: true,
  onTouchMove: true,
  onTouchStart: true,
  onScroll: true,
  onWheel: true,
  onAbort: true,
  onCanPlay: true,
  onCanPlayThrough: true,
  onDurationChange: true,
  onEmptied: true,
  onEncrypted: true,
  onEnded: true,
  onError: true,
  onLoadedData: true,
  onLoadedMetadata: true,
  onLoadStart: true,
  onPause: true,
  onPlay: true,
  onPlaying: true,
  onProgress: true,
  onRateChange: true,
  onSeeked: true,
  onSeeking: true,
  onStalled: true,
  onSuspend: true,
  onTimeUpdate: true,
  onVolumeChange: true,
  onWaiting: true,
  onLoad: true,
  onAnimationStart: true,
  onAnimationEnd: true,
  onAnimationIteration: true,
  onTransitionEnd: true,

  onCopyCapture: true,
  onCutCapture: true,
  onPasteCapture: true,
  onCompositionEndCapture: true,
  onCompositionStartCapture: true,
  onCompositionUpdateCapture: true,
  onKeyDownCapture: true,
  onKeyPressCapture: true,
  onKeyUpCapture: true,
  onFocusCapture: true,
  onBlurCapture: true,
  onChangeCapture: true,
  onInputCapture: true,
  onSubmitCapture: true,
  onClickCapture: true,
  onContextMenuCapture: true,
  onDoubleClickCapture: true,
  onDragCapture: true,
  onDragEndCapture: true,
  onDragEnterCapture: true,
  onDragExitCapture: true,
  onDragLeaveCapture: true,
  onDragOverCapture: true,
  onDragStartCapture: true,
  onDropCapture: true,
  onMouseDownCapture: true,
  onMouseEnterCapture: true,
  onMouseLeaveCapture: true,
  onMouseMoveCapture: true,
  onMouseOutCapture: true,
  onMouseOverCapture: true,
  onMouseUpCapture: true,
  onSelectCapture: true,
  onTouchCancelCapture: true,
  onTouchEndCapture: true,
  onTouchMoveCapture: true,
  onTouchStartCapture: true,
  onScrollCapture: true,
  onWheelCapture: true,
  onAbortCapture: true,
  onCanPlayCapture: true,
  onCanPlayThroughCapture: true,
  onDurationChangeCapture: true,
  onEmptiedCapture: true,
  onEncryptedCapture: true,
  onEndedCapture: true,
  onErrorCapture: true,
  onLoadedDataCapture: true,
  onLoadedMetadataCapture: true,
  onLoadStartCapture: true,
  onPauseCapture: true,
  onPlayCapture: true,
  onPlayingCapture: true,
  onProgressCapture: true,
  onRateChangeCapture: true,
  onSeekedCapture: true,
  onSeekingCapture: true,
  onStalledCapture: true,
  onSuspendCapture: true,
  onTimeUpdateCapture: true,
  onVolumeChangeCapture: true,
  onWaitingCapture: true,
  onLoadCapture: true,
  onAnimationStartCapture: true,
  onAnimationEndCapture: true,
  onAnimationIterationCapture: true,
  onTransitionEndCapture: true
};

/* From HTMLDOMPropertyConfig */
var htmlProps = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: true,
  allowTransparency: true,
  alt: true,
  // specifies target context for links with `preload` type
  as: true,
  async: true,
  autoComplete: true,
  // autoFocus is polyfilled/normalized by AutoFocusUtils
  // autoFocus: true,
  autoPlay: true,
  capture: true,
  cellPadding: true,
  cellSpacing: true,
  charSet: true,
  challenge: true,
  checked: true,
  cite: true,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: true,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  default: true,
  defer: true,
  dir: true,
  disabled: true,
  download: true,
  draggable: true,
  encType: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: true,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: true,
  high: true,
  href: true,
  hrefLang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  inputMode: true,
  integrity: true,
  is: true,
  keyParams: true,
  keyType: true,
  kind: true,
  label: true,
  lang: true,
  list: true,
  loop: true,
  low: true,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  minLength: true,
  // Caution; `option.selected` is not updated if `select.multiple` is
  // disabled with `removeAttribute`.
  multiple: true,
  muted: true,
  name: true,
  nonce: true,
  noValidate: true,
  open: true,
  optimum: true,
  pattern: true,
  placeholder: true,
  playsInline: true,
  poster: true,
  preload: true,
  profile: true,
  radioGroup: true,
  readOnly: true,
  referrerPolicy: true,
  rel: true,
  required: true,
  reversed: true,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scoped: true,
  scrolling: true,
  seamless: true,
  selected: true,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellCheck: true,
  src: true,
  srcDoc: true,
  srcLang: true,
  srcSet: true,
  start: true,
  step: true,
  style: true,
  summary: true,
  tabIndex: true,
  target: true,
  title: true,
  // Setting .type throws on non-<input> tags
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,
  wrap: true,

  /**
   * RDFa Properties
   */
  about: true,
  datatype: true,
  inlist: true,
  prefix: true,
  // property is also supported for OpenGraph in meta tags.
  property: true,
  resource: true,
  typeof: true,
  vocab: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autoCapitalize: true,
  autoCorrect: true,
  // autoSave allows WebKit/Blink to persist values of input fields on page reloads
  autoSave: true,
  // color is for Safari mask-icon link
  color: true,
  // itemProp, itemScope, itemType are for
  // Microdata support. See http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: true,
  itemType: true,
  // itemID and itemRef are for Microdata support as well but
  // only specified in the WHATWG spec document. See
  // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
  itemID: true,
  itemRef: true,
  // results show looking glass icon and recent searches on input
  // search fields in WebKit/Blink
  results: true,
  // IE-only attribute that specifies security restrictions on an iframe
  // as an alternative to the sandbox attribute on IE<10
  security: true,
  // IE-only attribute that controls focus behavior
  unselectable: 0
};

var svgProps = {
  accentHeight: true,
  accumulate: true,
  additive: true,
  alignmentBaseline: true,
  allowReorder: true,
  alphabetic: true,
  amplitude: true,
  arabicForm: true,
  ascent: true,
  attributeName: true,
  attributeType: true,
  autoReverse: true,
  azimuth: true,
  baseFrequency: true,
  baseProfile: true,
  baselineShift: true,
  bbox: true,
  begin: true,
  bias: true,
  by: true,
  calcMode: true,
  capHeight: true,
  clip: true,
  clipPath: true,
  clipRule: true,
  clipPathUnits: true,
  colorInterpolation: true,
  colorInterpolationFilters: true,
  colorProfile: true,
  colorRendering: true,
  contentScriptType: true,
  contentStyleType: true,
  cursor: true,
  cx: true,
  cy: true,
  d: true,
  decelerate: true,
  descent: true,
  diffuseConstant: true,
  direction: true,
  display: true,
  divisor: true,
  dominantBaseline: true,
  dur: true,
  dx: true,
  dy: true,
  edgeMode: true,
  elevation: true,
  enableBackground: true,
  end: true,
  exponent: true,
  externalResourcesRequired: true,
  fill: true,
  fillOpacity: true,
  fillRule: true,
  filter: true,
  filterRes: true,
  filterUnits: true,
  floodColor: true,
  floodOpacity: true,
  focusable: true,
  fontFamily: true,
  fontSize: true,
  fontSizeAdjust: true,
  fontStretch: true,
  fontStyle: true,
  fontVariant: true,
  fontWeight: true,
  format: true,
  from: true,
  fx: true,
  fy: true,
  g1: true,
  g2: true,
  glyphName: true,
  glyphOrientationHorizontal: true,
  glyphOrientationVertical: true,
  glyphRef: true,
  gradientTransform: true,
  gradientUnits: true,
  hanging: true,
  horizAdvX: true,
  horizOriginX: true,
  ideographic: true,
  imageRendering: true,
  in: true,
  in2: true,
  intercept: true,
  k: true,
  k1: true,
  k2: true,
  k3: true,
  k4: true,
  kernelMatrix: true,
  kernelUnitLength: true,
  kerning: true,
  keyPoints: true,
  keySplines: true,
  keyTimes: true,
  lengthAdjust: true,
  letterSpacing: true,
  lightingColor: true,
  limitingConeAngle: true,
  local: true,
  markerEnd: true,
  markerMid: true,
  markerStart: true,
  markerHeight: true,
  markerUnits: true,
  markerWidth: true,
  mask: true,
  maskContentUnits: true,
  maskUnits: true,
  mathematical: true,
  mode: true,
  numOctaves: true,
  offset: true,
  opacity: true,
  operator: true,
  order: true,
  orient: true,
  orientation: true,
  origin: true,
  overflow: true,
  overlinePosition: true,
  overlineThickness: true,
  paintOrder: true,
  panose1: true,
  pathLength: true,
  patternContentUnits: true,
  patternTransform: true,
  patternUnits: true,
  pointerEvents: true,
  points: true,
  pointsAtX: true,
  pointsAtY: true,
  pointsAtZ: true,
  preserveAlpha: true,
  preserveAspectRatio: true,
  primitiveUnits: true,
  r: true,
  radius: true,
  refX: true,
  refY: true,
  renderingIntent: true,
  repeatCount: true,
  repeatDur: true,
  requiredExtensions: true,
  requiredFeatures: true,
  restart: true,
  result: true,
  rotate: true,
  rx: true,
  ry: true,
  scale: true,
  seed: true,
  shapeRendering: true,
  slope: true,
  spacing: true,
  specularConstant: true,
  specularExponent: true,
  speed: true,
  spreadMethod: true,
  startOffset: true,
  stdDeviation: true,
  stemh: true,
  stemv: true,
  stitchTiles: true,
  stopColor: true,
  stopOpacity: true,
  strikethroughPosition: true,
  strikethroughThickness: true,
  string: true,
  stroke: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeLinecap: true,
  strokeLinejoin: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
  surfaceScale: true,
  systemLanguage: true,
  tableValues: true,
  targetX: true,
  targetY: true,
  textAnchor: true,
  textDecoration: true,
  textRendering: true,
  textLength: true,
  to: true,
  transform: true,
  u1: true,
  u2: true,
  underlinePosition: true,
  underlineThickness: true,
  unicode: true,
  unicodeBidi: true,
  unicodeRange: true,
  unitsPerEm: true,
  vAlphabetic: true,
  vHanging: true,
  vIdeographic: true,
  vMathematical: true,
  values: true,
  vectorEffect: true,
  version: true,
  vertAdvY: true,
  vertOriginX: true,
  vertOriginY: true,
  viewBox: true,
  viewTarget: true,
  visibility: true,
  widths: true,
  wordSpacing: true,
  writingMode: true,
  x: true,
  xHeight: true,
  x1: true,
  x2: true,
  xChannelSelector: true,
  xlinkActuate: true,
  xlinkArcrole: true,
  xlinkHref: true,
  xlinkRole: true,
  xlinkShow: true,
  xlinkTitle: true,
  xlinkType: true,
  xmlBase: true,
  xmlns: true,
  xmlnsXlink: true,
  xmlLang: true,
  xmlSpace: true,
  y: true,
  y1: true,
  y2: true,
  yChannelSelector: true,
  z: true,
  zoomAndPan: true
};

/* From DOMProperty */
var ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
var ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
var isCustomAttribute = RegExp.prototype.test.bind(
  new RegExp('^(data|aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$')
);

var hasOwnProperty = {}.hasOwnProperty;
var validAttr = function(name) {
  return (
    hasOwnProperty.call(htmlProps, name) ||
    hasOwnProperty.call(svgProps, name) ||
    isCustomAttribute(name.toLowerCase()) ||
    hasOwnProperty.call(reactProps, name)
  );
};

//

function isTag(target) /* : %checks */ {
  return typeof target === 'string';
}

//

function isStyledComponent(target) /* : %checks */ {
  return (
    typeof target === 'function' && typeof target.styledComponentId === 'string'
  );
}

//

/* eslint-disable no-undef */
function getComponentName(target) {
  return target.displayName || target.name || 'Component';
}

var index$4 = isFunction;

var toString = Object.prototype.toString;

function isFunction(fn) {
  var string = toString.call(fn);
  return (
    string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
      // IE8 and below
      (fn === window.setTimeout ||
        fn === window.alert ||
        fn === window.confirm ||
        fn === window.prompt))
  );
}

//
/**
 * Creates a broadcast that can be listened to, i.e. simple event emitter
 *
 * @see https://github.com/ReactTraining/react-broadcast
 */

var createBroadcast = function createBroadcast(initialValue) {
  var listeners = [];
  var currentValue = initialValue;

  return {
    publish: function publish(value) {
      currentValue = value;
      listeners.forEach(function(listener) {
        return listener(currentValue);
      });
    },
    subscribe: function subscribe(listener) {
      listeners.push(listener);

      // Publish to this subscriber once immediately.
      listener(currentValue);

      return function() {
        listeners = listeners.filter(function(item) {
          return item !== listener;
        });
      };
    }
  };
};

var _ThemeProvider$childC;
var _ThemeProvider$contex;

//
/* globals React$Element */
// NOTE: DO NOT CHANGE, changing this is a semver major change!
var CHANNEL = '__styled-components__';

/**
 * Provide a theme to an entire react component tree via context and event listeners (have to do
 * both context and event emitter as pure components block context updates)
 */

var ThemeProvider = (function(_Component) {
  inherits(ThemeProvider, _Component);

  function ThemeProvider() {
    classCallCheck(this, ThemeProvider);

    var _this = possibleConstructorReturn(this, _Component.call(this));

    _this.getTheme = _this.getTheme.bind(_this);
    return _this;
  }

  ThemeProvider.prototype.componentWillMount = function componentWillMount() {
    var _this2 = this;

    // If there is a ThemeProvider wrapper anywhere around this theme provider, merge this theme
    // with the outer theme
    if (this.context[CHANNEL]) {
      var subscribe = this.context[CHANNEL];
      this.unsubscribeToOuter = subscribe(function(theme) {
        _this2.outerTheme = theme;
      });
    }
    this.broadcast = createBroadcast(this.getTheme());
  };

  ThemeProvider.prototype.getChildContext = function getChildContext() {
    var _babelHelpers$extends;

    return _extends(
      {},
      this.context,
      (
        (_babelHelpers$extends = {}),
        (_babelHelpers$extends[CHANNEL] = this.broadcast.subscribe),
        _babelHelpers$extends
      )
    );
  };

  ThemeProvider.prototype.componentWillReceiveProps = function componentWillReceiveProps(
    nextProps
  ) {
    if (this.props.theme !== nextProps.theme)
      this.broadcast.publish(this.getTheme(nextProps.theme));
  };

  ThemeProvider.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.context[CHANNEL]) {
      this.unsubscribeToOuter();
    }
  };

  // Get the theme from the props, supporting both (outerTheme) => {} as well as object notation

  ThemeProvider.prototype.getTheme = function getTheme(passedTheme) {
    var theme = passedTheme || this.props.theme;
    if (index$4(theme)) {
      var mergedTheme = theme(this.outerTheme);
      if (!index(mergedTheme)) {
        throw new Error(
          '[ThemeProvider] Please return an object from your theme function, i.e. theme={() => ({})}!'
        );
      }
      return mergedTheme;
    }
    if (!index(theme)) {
      throw new Error(
        '[ThemeProvider] Please make your theme prop a plain object'
      );
    }
    return _extends({}, this.outerTheme, theme);
  };

  ThemeProvider.prototype.render = function render() {
    if (!this.props.children) {
      return null;
    }
    return React__default.Children.only(this.props.children);
  };

  return ThemeProvider;
})(React.Component);

ThemeProvider.childContextTypes = (
  (_ThemeProvider$childC = {}),
  (_ThemeProvider$childC[CHANNEL] = index$3.func.isRequired),
  _ThemeProvider$childC
);
ThemeProvider.contextTypes = (
  (_ThemeProvider$contex = {}),
  (_ThemeProvider$contex[CHANNEL] = index$3.func),
  _ThemeProvider$contex
);

var _AbstractStyledCompon;

//
var AbstractStyledComponent = (function(_Component) {
  inherits(AbstractStyledComponent, _Component);

  function AbstractStyledComponent() {
    classCallCheck(this, AbstractStyledComponent);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  return AbstractStyledComponent;
})(React.Component);

AbstractStyledComponent.contextTypes = (
  (_AbstractStyledCompon = {}),
  (_AbstractStyledCompon[CHANNEL] = index$3.func),
  (_AbstractStyledCompon[CONTEXT_KEY] = index$3.instanceOf(StyleSheet)),
  _AbstractStyledCompon
);

//

var escapeRegex = /[[\].#*$><+~=|^:(),"'`]/g;
var multiDashRegex = /--+/g;

var _StyledComponent = function(ComponentStyle, constructWithOptions) {
  /* We depend on components having unique IDs */
  var identifiers = {};
  var generateId = function generateId(_displayName) {
    var displayName = typeof _displayName !== 'string'
      ? 'sc'
      : _displayName
          .replace(escapeRegex, '-') // Replace all possible CSS selectors
          .replace(multiDashRegex, '-'); // Replace multiple -- with single -

    var nr = (identifiers[displayName] || 0) + 1;
    identifiers[displayName] = nr;

    var hash = ComponentStyle.generateName(displayName + nr);
    return displayName + '-' + hash;
  };

  var BaseStyledComponent = (function(_AbstractStyledCompon) {
    inherits(BaseStyledComponent, _AbstractStyledCompon);

    function BaseStyledComponent() {
      var _temp, _this, _ret;

      classCallCheck(this, BaseStyledComponent);

      for (
        var _len = arguments.length, args = Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }

      return (_ret = (
        (_temp = (
          (_this = possibleConstructorReturn(
            this,
            _AbstractStyledCompon.call.apply(
              _AbstractStyledCompon,
              [this].concat(args)
            )
          )),
          _this
        )),
        (_this.attrs = {}),
        (_this.state = {
          theme: null,
          generatedClassName: ''
        }),
        _temp
      )), possibleConstructorReturn(_this, _ret);
    }

    BaseStyledComponent.prototype.buildExecutionContext = function buildExecutionContext(
      theme,
      props
    ) {
      var attrs = this.constructor.attrs;

      var context = _extends({}, props, { theme: theme });
      if (attrs === undefined) {
        return context;
      }

      this.attrs = Object.keys(attrs).reduce(function(acc, key) {
        var attr = attrs[key];
        // eslint-disable-next-line no-param-reassign
        acc[key] = typeof attr === 'function' ? attr(context) : attr;
        return acc;
      }, {});

      return _extends({}, context, this.attrs);
    };

    BaseStyledComponent.prototype.generateAndInjectStyles = function generateAndInjectStyles(
      theme,
      props
    ) {
      var _constructor = this.constructor,
        componentStyle = _constructor.componentStyle,
        warnTooManyClasses = _constructor.warnTooManyClasses;

      var executionContext = this.buildExecutionContext(theme, props);
      var styleSheet = this.context[CONTEXT_KEY] || StyleSheet.instance;
      var className = componentStyle.generateAndInjectStyles(
        executionContext,
        styleSheet
      );

      if (warnTooManyClasses !== undefined) warnTooManyClasses(className);

      return className;
    };

    BaseStyledComponent.prototype.componentWillMount = function componentWillMount() {
      var _this2 = this;

      // If there is a theme in the context, subscribe to the event emitter. This
      // is necessary due to pure components blocking context updates, this circumvents
      // that by updating when an event is emitted
      if (this.context[CHANNEL]) {
        var subscribe = this.context[CHANNEL];
        this.unsubscribe = subscribe(function(nextTheme) {
          // This will be called once immediately

          // Props should take precedence over ThemeProvider, which should take precedence over
          // defaultProps, but React automatically puts defaultProps on props.
          var defaultProps = _this2.constructor.defaultProps;

          var isDefaultTheme =
            defaultProps && _this2.props.theme === defaultProps.theme;
          var theme = _this2.props.theme && !isDefaultTheme
            ? _this2.props.theme
            : nextTheme;
          var generatedClassName = _this2.generateAndInjectStyles(
            theme,
            _this2.props
          );
          _this2.setState({
            theme: theme,
            generatedClassName: generatedClassName
          });
        });
      } else {
        var theme = this.props.theme || {};
        var generatedClassName = this.generateAndInjectStyles(
          theme,
          this.props
        );
        this.setState({ theme: theme, generatedClassName: generatedClassName });
      }
    };

    BaseStyledComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps(
      nextProps
    ) {
      var _this3 = this;

      this.setState(function(oldState) {
        // Props should take precedence over ThemeProvider, which should take precedence over
        // defaultProps, but React automatically puts defaultProps on props.
        var defaultProps = _this3.constructor.defaultProps;

        var isDefaultTheme =
          defaultProps && nextProps.theme === defaultProps.theme;
        var theme = nextProps.theme && !isDefaultTheme
          ? nextProps.theme
          : oldState.theme;
        var generatedClassName = _this3.generateAndInjectStyles(
          theme,
          nextProps
        );

        return { theme: theme, generatedClassName: generatedClassName };
      });
    };

    BaseStyledComponent.prototype.componentWillUnmount = function componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    };

    BaseStyledComponent.prototype.render = function render() {
      var _this4 = this;

      var innerRef = this.props.innerRef;
      var generatedClassName = this.state.generatedClassName;
      var _constructor2 = this.constructor,
        styledComponentId = _constructor2.styledComponentId,
        target = _constructor2.target;

      var isTargetTag = isTag(target);

      var className = [
        this.props.className,
        styledComponentId,
        this.attrs.className,
        generatedClassName
      ]
        .filter(Boolean)
        .join(' ');

      var baseProps = _extends({}, this.attrs, {
        className: className
      });

      if (isStyledComponent(target)) {
        baseProps.innerRef = innerRef;
      } else {
        baseProps.ref = innerRef;
      }

      var propsForElement = Object.keys(this.props).reduce(function(
        acc,
        propName
      ) {
        // Don't pass through non HTML tags through to HTML elements
        // always omit innerRef
        if (
          propName !== 'innerRef' &&
          propName !== 'className' &&
          (!isTargetTag || validAttr(propName))
        ) {
          // eslint-disable-next-line no-param-reassign
          acc[propName] = _this4.props[propName];
        }

        return acc;
      }, baseProps);

      return React.createElement(target, propsForElement);
    };

    return BaseStyledComponent;
  })(AbstractStyledComponent);

  var createStyledComponent = function createStyledComponent(
    target,
    options,
    rules
  ) {
    var _StyledComponent$cont;

    var _options$displayName = options.displayName,
      displayName = _options$displayName === undefined
        ? isTag(target)
          ? 'styled.' + target
          : 'Styled(' + getComponentName(target) + ')'
        : _options$displayName,
      _options$componentId = options.componentId,
      componentId = _options$componentId === undefined
        ? generateId(options.displayName)
        : _options$componentId,
      _options$ParentCompon = options.ParentComponent,
      ParentComponent = _options$ParentCompon === undefined
        ? BaseStyledComponent
        : _options$ParentCompon,
      extendingRules = options.rules,
      attrs = options.attrs;

    var styledComponentId = options.displayName && options.componentId
      ? options.displayName + '-' + options.componentId
      : componentId;

    var warnTooManyClasses = void 0;
    if (typeof process !== 'undefined' && 'development' !== 'production') {
      warnTooManyClasses = createWarnTooManyClasses(displayName);
    }

    var componentStyle = new ComponentStyle(
      extendingRules === undefined ? rules : extendingRules.concat(rules),
      styledComponentId
    );

    var StyledComponent = (function(_ParentComponent) {
      inherits(StyledComponent, _ParentComponent);

      function StyledComponent() {
        classCallCheck(this, StyledComponent);
        return possibleConstructorReturn(
          this,
          _ParentComponent.apply(this, arguments)
        );
      }

      StyledComponent.withComponent = function withComponent(tag) {
        var _ = options.displayName,
          __ = options.componentId,
          optionsToCopy = objectWithoutProperties(options, [
            'displayName',
            'componentId'
          ]);

        var newOptions = _extends({}, optionsToCopy, {
          ParentComponent: StyledComponent
        });
        return createStyledComponent(tag, newOptions, rules);
      };

      createClass(StyledComponent, null, [
        {
          key: 'extend',
          get: function get() {
            var _ = options.displayName,
              __ = options.componentId,
              rulesFromOptions = options.rules,
              optionsToCopy = objectWithoutProperties(options, [
                'displayName',
                'componentId',
                'rules'
              ]);

            var newRules = rulesFromOptions === undefined
              ? rules
              : rulesFromOptions.concat(rules);

            var newOptions = _extends({}, optionsToCopy, {
              rules: newRules,
              ParentComponent: StyledComponent
            });

            return constructWithOptions(
              createStyledComponent,
              target,
              newOptions
            );
          }
        }
      ]);
      return StyledComponent;
    })(ParentComponent);

    StyledComponent.contextTypes = (
      (_StyledComponent$cont = {}),
      (_StyledComponent$cont[CHANNEL] = index$3.func),
      (_StyledComponent$cont[CONTEXT_KEY] = index$3.instanceOf(StyleSheet)),
      _StyledComponent$cont
    );
    StyledComponent.displayName = displayName;
    StyledComponent.styledComponentId = styledComponentId;
    StyledComponent.attrs = attrs;
    StyledComponent.componentStyle = componentStyle;
    StyledComponent.warnTooManyClasses = warnTooManyClasses;
    StyledComponent.target = target;

    return StyledComponent;
  };

  return createStyledComponent;
};

// murmurhash2 via https://gist.github.com/raycmorgan/588423

function doHash(str, seed) {
  var m = 0x5bd1e995;
  var r = 24;
  var h = seed ^ str.length;
  var length = str.length;
  var currentIndex = 0;

  while (length >= 4) {
    var k = UInt32(str, currentIndex);

    k = Umul32(k, m);
    k ^= k >>> r;
    k = Umul32(k, m);

    h = Umul32(h, m);
    h ^= k;

    currentIndex += 4;
    length -= 4;
  }

  switch (length) {
    case 3:
      h ^= UInt16(str, currentIndex);
      h ^= str.charCodeAt(currentIndex + 2) << 16;
      h = Umul32(h, m);
      break;

    case 2:
      h ^= UInt16(str, currentIndex);
      h = Umul32(h, m);
      break;

    case 1:
      h ^= str.charCodeAt(currentIndex);
      h = Umul32(h, m);
      break;
  }

  h ^= h >>> 13;
  h = Umul32(h, m);
  h ^= h >>> 15;

  return h >>> 0;
}

function UInt32(str, pos) {
  return (
    str.charCodeAt(pos++) +
    (str.charCodeAt(pos++) << 8) +
    (str.charCodeAt(pos++) << 16) +
    (str.charCodeAt(pos) << 24)
  );
}

function UInt16(str, pos) {
  return str.charCodeAt(pos++) + (str.charCodeAt(pos++) << 8);
}

function Umul32(n, m) {
  n = n | 0;
  m = m | 0;
  var nlo = n & 0xffff;
  var nhi = n >>> 16;
  var res = (nlo * m + (((nhi * m) & 0xffff) << 16)) | 0;
  return res;
}

//
/*
 ComponentStyle is all the CSS-specific stuff, not
 the React-specific stuff.
 */
var _ComponentStyle = function(nameGenerator, flatten, stringifyRules) {
  var ComponentStyle = (function() {
    function ComponentStyle(rules, componentId) {
      classCallCheck(this, ComponentStyle);

      this.rules = rules;
      this.componentId = componentId;
      if (!StyleSheet.instance.hasInjectedComponent(this.componentId)) {
        var placeholder = '.' + componentId + ' {}';
        StyleSheet.instance.deferredInject(componentId, true, placeholder);
      }
    }

    /*
     * Flattens a rule set into valid CSS
     * Hashes it, wraps the whole chunk in a .hash1234 {}
     * Returns the hash to be injected on render()
     * */

    ComponentStyle.prototype.generateAndInjectStyles = function generateAndInjectStyles(
      executionContext,
      styleSheet
    ) {
      var flatCSS = flatten(this.rules, executionContext);
      var hash = doHash(this.componentId + flatCSS.join(''));

      var existingName = styleSheet.getName(hash);
      if (existingName) return existingName;

      var name = nameGenerator(hash);
      if (styleSheet.alreadyInjected(hash, name)) return name;

      var css = '\n' + stringifyRules(flatCSS, '.' + name);
      styleSheet.inject(this.componentId, true, css, hash, name);
      return name;
    };

    ComponentStyle.generateName = function generateName(str) {
      return nameGenerator(doHash(str));
    };

    return ComponentStyle;
  })();

  return ComponentStyle;
};

//
// Thanks to ReactDOMFactories for this handy list!

var domElements = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',

  // SVG
  'circle',
  'clipPath',
  'defs',
  'ellipse',
  'g',
  'image',
  'line',
  'linearGradient',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'text',
  'tspan'
];

//

var _styled = function(styledComponent, constructWithOptions) {
  var styled = function styled(tag) {
    return constructWithOptions(styledComponent, tag);
  };

  // Shorthands for all valid HTML Elements
  domElements.forEach(function(domElement) {
    styled[domElement] = styled(domElement);
  });

  return styled;
};

//

var _constructWithOptions = function(css) {
  var constructWithOptions = function constructWithOptions(
    componentConstructor,
    tag
  ) {
    var options = arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : {};

    if (typeof tag !== 'string' && typeof tag !== 'function') {
      // $FlowInvalidInputTest
      throw new Error('Cannot create styled-component for component: ' + tag);
    }

    /* This is callable directly as a template function */
    var templateFunction = function templateFunction(strings) {
      for (
        var _len = arguments.length,
          interpolations = Array(_len > 1 ? _len - 1 : 0),
          _key = 1;
        _key < _len;
        _key++
      ) {
        interpolations[_key - 1] = arguments[_key];
      }

      return componentConstructor(
        tag,
        options,
        css.apply(undefined, [strings].concat(interpolations))
      );
    };

    /* If config methods are called, wrap up a new template function and merge options */
    templateFunction.withConfig = function(config) {
      return constructWithOptions(
        componentConstructor,
        tag,
        _extends({}, options, config)
      );
    };
    templateFunction.attrs = function(attrs) {
      return constructWithOptions(
        componentConstructor,
        tag,
        _extends({}, options, {
          attrs: _extends({}, options.attrs || {}, attrs)
        })
      );
    };

    return templateFunction;
  };

  return constructWithOptions;
};

//

/* Import singletons */
/* Import singleton constructors */
/* Import components */
/* Import Higher Order Components */
/* Instantiate singletons */
var ComponentStyle = _ComponentStyle(
  generateAlphabeticName,
  flatten,
  stringifyRules
);
var constructWithOptions = _constructWithOptions(css);
var StyledComponent = _StyledComponent(ComponentStyle, constructWithOptions);

var styled = _styled(StyledComponent, constructWithOptions);

function sassRgba(color, alpha) {
  return polished.rgba(
    Object.assign(polished.parseToRgb(color), { alpha: alpha })
  );
}

// General variable structure

// Colors
//
// Grayscale and brand colors for use across Bootstrap.

// Start with assigning color names to specific hex values.
var white = '#fff';
var black = '#000';
var red = '#d9534f';
var orange = '#f0ad4e';

var green = '#5cb85c';
var blue = '#0275d8';
var teal = '#5bc0de';

// Create grayscale
var grayDark = '#292b2c';

var grayLight = '#636c72';
var grayLighter = '#eceeef';

// Reassign color vars to semantic color scheme
var brandPrimary = blue;
var brandSuccess = green;
var brandInfo = teal;
var brandWarning = orange;
var brandDanger = red;

// Options
//
// Quickly modify global styling by enabling or disabling optional features.

var enableRounded = true;
var enableShadows = false;

var enableTransitions = true;
var enableHoverMediaQuery = false;

// Spacing
//
// Control the default styling of most Bootstrap elements by modifying these
// variables. Mostly focused on spacing.
// You can add more entries to the $spacers map, should you need more variation.

// export const spacer = '1rem';

var borderWidth = '1px';

// This variable affects the `.h-*` and `.w-*` classes.

// Body
//
// Settings for the `<body>` element.

// Links
//
// Style anchor elements.

var linkColor = brandPrimary;

var linkHoverColor = polished.darken(0.15, linkColor);

// Components
//
// Define common padding and border radius sizes and more.

var borderRadius$1 = '0.25rem';
var borderRadiusLg = '0.3rem';
var borderRadiusSm = '0.2rem';

var transitionBase = 'all .2s ease-in-out';

// Fonts
//
// Font, lineHeight, and color for body text, headings, and more.

var fontSizeBase = '1rem';
var fontSizeLg = '1.25rem';
var fontSizeSm = '0.875rem';

var fontWeightNormal = 'normal';
var fontWeightBold = 'bold';

// Form states and alerts
//
// Define colors for form feedback states and, by default, alerts.

var stateSuccessText = '#3c763d';
var stateSuccessBg = '#dff0d8';
var stateSuccessBorderColor = polished.darken(0.05, stateSuccessBg);

var stateInfoText = '#31708f';
var stateInfoBg = '#d9edf7';
var stateInfoBorderColor = polished.darken(0.07, stateInfoBg);

var stateWarningText = '#8a6d3b';
var stateWarningBg = '#fcf8e3';

var stateWarningBorderColor = polished.darken(0.05, stateWarningBg);

var stateDangerText = '#a94442';
var stateDangerBg = '#f2dede';
var stateDangerBorderColor = polished.darken(0.05, stateDangerBg);

// Badges

var badgeDefaultBg = grayLight;
var badgePrimaryBg = brandPrimary;
var badgeSuccessBg = brandSuccess;
var badgeInfoBg = brandInfo;
var badgeWarningBg = brandWarning;
var badgeDangerBg = brandDanger;

var badgeColor = white;
var badgeLinkHoverColor = white;
var badgeFontSize = '75%';
var badgeFontWeight = fontWeightBold;
var badgePaddingY = '.25em';
var badgePaddingX = '.4em';

var badgePillPaddingX = '.6em';
// Use a higher than normal value to ensure completely rounded edges when
// customizing padding or fontSize on labels.
var badgePillBorderRadius = '10rem';

// Buttons
//
// For each of Bootstrap's buttons, define text, background and border color.

var inputBtnPaddingY = '.5rem';
var inputBtnPaddingX = '1rem';
var inputBtnLineHeight = 1.25;

var inputBtnPaddingYsm = '.25rem';
var inputBtnPaddingXsm = '.5rem';
var inputBtnLineHeightSm = 1.5;

var inputBtnPaddingYlg = '.5rem';
var inputBtnPaddingXlg = '1rem';
var inputBtnLineHeightLg = 1.5;

var btnFontWeight = fontWeightNormal;
var btnBoxShadow =
  'inset 0 1px 0 ' +
  sassRgba(white, 0.15) +
  ', 0 1px 1px ' +
  sassRgba(black, 0.075);
var btnFocusBoxShadow = '0 0 0 2px ' + sassRgba(brandPrimary, 0.25);
var btnActiveBoxShadow = 'inset 0 3px 5px rgba($black,.125)';

var btnPrimaryColor = white;
var btnPrimaryBg = brandPrimary;
var btnPrimaryBorderColor = btnPrimaryBg;

var btnSecondaryColor = grayDark;
var btnSecondaryBg = white;
var btnSecondaryBorderColor = '#ccc';

var btnInfoColor = white;
var btnInfoBg = brandInfo;
var btnInfoBorderColor = btnInfoBg;

var btnSuccessColor = white;
var btnSuccessBg = brandSuccess;
var btnSuccessBorderColor = btnSuccessBg;

var btnWarningColor = white;
var btnWarningBg = brandWarning;
var btnWarningBorderColor = btnWarningBg;

var btnDangerColor = white;
var btnDangerBg = brandDanger;
var btnDangerBorderColor = btnDangerBg;

var btnLinkDisabledColor = grayLight;

var btnBlockSpacingY = '.5rem';

// Allows for customizing button radius independently from global border radius
var btnBorderRadius = borderRadius$1;
var btnBorderRadiusLg = borderRadiusLg;
var btnBorderRadiusSm = borderRadiusSm;

var btnTransition = 'all .2s ease-in-out';

// Forms

var inputBorderColor = sassRgba(black, 0.15);
var inputBtnBorderWidth = borderWidth; // For form controls ans
var inputBoxShadow = 'inset 0 1px 1px ' + sassRgba(black, 0.075);

var inputBorderColorFocus = polished.lighten(0.25, brandPrimary);
var inputBoxShadowFocus =
  inputBoxShadow + ', ' + sassRgba(inputBorderColorFocus, 0.6);

// Dropdowns
//
// Dropdown menu container and contents.

var dropdownBorderColor = sassRgba(black, 0.15);

var dropdownBoxShadow = '0 .5rem 1rem ' + sassRgba(black, 0.175);

var dropdownLinkHoverColor = polished.darken(0.05, grayDark);

// Alerts
//
// Define alert colors, border radius, and padding.

var alertPaddingY = '.75rem';
var alertPaddingX = '1.25rem';
var alertMarginBottom = '1rem';
var alertBorderRadius = borderRadius$1;
var alertLinkFontWeight = fontWeightBold;
var alertBorderWidth = borderWidth;

var alertSuccessBg = stateSuccessBg;
var alertSuccessText = stateSuccessText;
var alertSuccessBorderColor = stateSuccessBorderColor;

var alertInfoBg = stateInfoBg;
var alertInfoText = stateInfoText;
var alertInfoBorderColor = stateInfoBorderColor;

var alertWarningBg = stateWarningBg;
var alertWarningText = stateWarningText;
var alertWarningBorderColor = stateWarningBorderColor;

var alertDangerBg = stateDangerBg;
var alertDangerText = stateDangerText;
var alertDangerBorderColor = stateDangerBorderColor;

// Grid columns
//
// Set the number of columns and specify the width of the gutters.

// Breadcrumbs

var breadcrumbPaddingY = '.75rem';
var breadcrumbPaddingX = '1rem';
var breadcrumbItemPadding = '.5rem';
var breadcrumbBg = grayLighter;
var breadcrumbDividerColor = grayLight;
var breadcrumbActiveColor = grayLight;
var breadcrumbDivider = '"/"';

var taggedTemplateLiteral = function(strings, raw) {
  return Object.freeze(
    Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    })
  );
};

var _templateObject$1 = taggedTemplateLiteral(
  ['\n      border-radius: ', ';\n    '],
  ['\n      border-radius: ', ';\n    ']
);
var _templateObject2 = taggedTemplateLiteral(
  [
    '\n      border-top-right-radius: ',
    ';\n      border-top-left-radius: ',
    ';\n    '
  ],
  [
    '\n      border-top-right-radius: ',
    ';\n      border-top-left-radius: ',
    ';\n    '
  ]
);
var _templateObject3 = taggedTemplateLiteral(
  [
    '\n      border-bottom-right-radius: ',
    ';\n      border-top-right-radius: $radius;\n    '
  ],
  [
    '\n      border-bottom-right-radius: ',
    ';\n      border-top-right-radius: $radius;\n    '
  ]
);
var _templateObject4 = taggedTemplateLiteral(
  [
    '\n      border-bottom-right-radius: ',
    ';\n      border-bottom-left-radius: ',
    ';\n    '
  ],
  [
    '\n      border-bottom-right-radius: ',
    ';\n      border-bottom-left-radius: ',
    ';\n    '
  ]
);
var _templateObject5 = taggedTemplateLiteral(
  [
    '\n      border-bottom-left-radius: ',
    ';\n      border-top-left-radius: ',
    ';\n    '
  ],
  [
    '\n      border-bottom-left-radius: ',
    ';\n      border-top-left-radius: ',
    ';\n    '
  ]
);

function borderRadius() {
  var radius = arguments.length > 0 && arguments[0] !== undefined
    ? arguments[0]
    : '0.25rem';

  if (enableRounded) {
    return css(_templateObject$1, radius);
  }
}

var _templateObject$2 = taggedTemplateLiteral(
  [
    '\n    color: ',
    ';\n    background-color: ',
    ';\n    border-color: ',
    ';\n\n    hr {\n      border-top-color: ',
    ';\n    }\n\n    a {\n      color: ',
    ';\n    }\n  '
  ],
  [
    '\n    color: ',
    ';\n    background-color: ',
    ';\n    border-color: ',
    ';\n\n    hr {\n      border-top-color: ',
    ';\n    }\n\n    a {\n      color: ',
    ';\n    }\n  '
  ]
);

function alertVariant(background, border, bodyColor) {
  return css(
    _templateObject$2,
    bodyColor,
    background,
    border,
    polished.darken(0.05, border),
    polished.darken(0.1, bodyColor)
  );
}

var _templateObject$4 = taggedTemplateLiteral(
  ['\n  &:hover { ', ' }\n'],
  ['\n  &:hover { ', ' }\n']
);
var _templateObject2$1 = taggedTemplateLiteral(
  ['\n      &:focus { ', '} }\n      ', '\n    '],
  ['\n      &:focus { ', '} }\n      ', '\n    ']
);
var _templateObject3$1 = taggedTemplateLiteral(
  ['\n    &:focus,\n    &:hover {\n      ', '\n    }\n  '],
  ['\n    &:focus,\n    &:hover {\n      ', '\n    }\n  ']
);
var _templateObject4$1 = taggedTemplateLiteral(
  ['\n      &,\n      &:focus {\n        ', '\n      }\n      ', '\n    '],
  ['\n      &,\n      &:focus {\n        ', '\n      }\n      ', '\n    ']
);
var _templateObject5$1 = taggedTemplateLiteral(
  ['\n    &,\n    &:focus,\n    &:hover {\n      ', '\n    }\n  '],
  ['\n    &,\n    &:focus,\n    &:hover {\n      ', '\n    }\n  ']
);
var _templateObject6 = taggedTemplateLiteral(
  [
    '\n      &:focus,\n      &:active {\n        ',
    '\n      }\n      ',
    '\n    '
  ],
  [
    '\n      &:focus,\n      &:active {\n        ',
    '\n      }\n      ',
    '\n    '
  ]
);
var _templateObject7 = taggedTemplateLiteral(
  ['\n    &:focus,\n    &:active,\n    &:hover {\n      ', '\n    }\n  '],
  ['\n    &:focus,\n    &:active,\n    &:hover {\n      ', '\n    }\n  ']
);

var hover = function hover(content) {
  return css(_templateObject$4, content);
};

var hoverFocus = function hoverFocus(content) {
  if (enableHoverMediaQuery) {
    return css(_templateObject2$1, content, hover(content));
  }

  return css(_templateObject3$1, content);
};

var _templateObject$3 = taggedTemplateLiteral(
  [
    '\n  font-size: ',
    ';\n  font-weight: ',
    ';\n  line-height: 1;\n  color: ',
    ';\n  text-shadow: ',
    ';\n  opacity: .5;\n\n  ',
    ';\n\n  padding: 0;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none;\n'
  ],
  [
    '\n  font-size: ',
    ';\n  font-weight: ',
    ';\n  line-height: 1;\n  color: ',
    ';\n  text-shadow: ',
    ';\n  opacity: .5;\n\n  ',
    ';\n\n  padding: 0;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none;\n'
  ]
);

var StyledCloseIcon = styled.button(
  _templateObject$3,
  function(props) {
    return props.theme.closeFontSize;
  },
  function(props) {
    return props.theme.closeFontWeight;
  },
  function(props) {
    return props.theme.closeColor;
  },
  function(props) {
    return props.theme.closeTextShadow;
  },
  hoverFocus(
    '\n    color: ' +
      function(props) {
        return props.theme.closeColor;
      } +
      ';\n    text-decoration: none;\n    opacity: .75;\n  '
  )
);

var CloseIcon = function CloseIcon(props) {
  return React__default.createElement(
    StyledCloseIcon,
    props,
    React__default.createElement('span', { 'aria-hidden': 'true' }, '\xD7')
  );
};

CloseIcon.defaultProps = {
  theme: {
    closeFontSize: polished.stripUnit(fontSizeBase) * 1.5 + 'rem',
    closeFontWeight: fontWeightBold,
    closeColor: black,
    closeTextWhadow: '0 1px 0 ' + white
  }
};

var _templateObject = taggedTemplateLiteral(
  [
    '\n  ',
    '\n  margin-bottom: ',
    ';\n  border: ',
    ' solid transparent;\n\n  a {\n    font-weight: ',
    ';\n  }\n\n  ',
    '\n\n  ',
    '\n\n  ',
    ' {\n    position: relative;\n    float: right;\n    top: -',
    ';\n    right: -',
    ';\n    ',
    '\n    color: inherit;\n  }\n'
  ],
  [
    '\n  ',
    '\n  margin-bottom: ',
    ';\n  border: ',
    ' solid transparent;\n\n  a {\n    font-weight: ',
    ';\n  }\n\n  ',
    '\n\n  ',
    '\n\n  ',
    ' {\n    position: relative;\n    float: right;\n    top: -',
    ';\n    right: -',
    ';\n    ',
    '\n    color: inherit;\n  }\n'
  ]
);

var Alert = styled.div(
  _templateObject,
  function(props) {
    return (
      'padding: ' +
      props.theme.alertPaddingY +
      ' ' +
      props.theme.alertPaddingX +
      ';'
    );
  },
  function(props) {
    return props.theme.alertMarginBottom;
  },
  function(props) {
    return props.theme.alertBorderWidth;
  },
  function(props) {
    return props.theme.alertLinkFontWeight;
  },
  function(props) {
    return borderRadius(props.theme.alertBorderRadius);
  },
  function(_ref) {
    var theme = _ref.theme,
      type = _ref.type;

    switch (type) {
      case 'success':
        return alertVariant(
          theme.alertSuccessBg,
          theme.alertSuccessBorderColor,
          theme.alertSuccessText
        );
      case 'info':
        return alertVariant(
          theme.alertInfoBg,
          theme.alertInfoBorderColor,
          theme.alertInfoText
        );
      case 'warning':
        return alertVariant(
          theme.alertWarningBg,
          theme.alertWarningBorderColor,
          theme.alertWarningText
        );
      case 'danger':
        return alertVariant(
          theme.alertDangerBg,
          theme.alertDangerBorderColor,
          theme.alertDangerText
        );
      default:
        return null;
    }
  },
  StyledCloseIcon,
  function(props) {
    return props.theme.alertPaddingY;
  },
  function(props) {
    return props.theme.alertPaddingX;
  },
  function(props) {
    return (
      'padding: ' +
      props.theme.alertPaddingY +
      ' ' +
      props.theme.alertPaddingX +
      ';'
    );
  }
);

Alert.defaultProps = {
  theme: {
    alertPaddingY: alertPaddingY,
    alertPaddingX: alertPaddingX,
    alertMarginBottom: alertMarginBottom,
    alertBorderRadius: alertBorderRadius,
    alertLinkFontWeight: alertLinkFontWeight,
    alertBorderWidth: alertBorderWidth,

    alertSuccessBg: alertSuccessBg,
    alertSuccessText: alertSuccessText,
    alertSuccessBorderColor: alertSuccessBorderColor,

    alertInfoBg: alertInfoBg,
    alertInfoText: alertInfoText,
    alertInfoBorderColor: alertInfoBorderColor,

    alertWarningBg: alertWarningBg,
    alertWarningText: alertWarningText,
    alertWarningBorderColor: alertWarningBorderColor,

    alertDangerBg: alertDangerBg,
    alertDangerText: alertDangerText,
    alertDangerBorderColor: alertDangerBorderColor
  }
};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction$1(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction$1$1 = function emptyFunction() {};

emptyFunction$1$1.thatReturns = makeEmptyFunction$1;
emptyFunction$1$1.thatReturnsFalse = makeEmptyFunction$1(false);
emptyFunction$1$1.thatReturnsTrue = makeEmptyFunction$1(true);
emptyFunction$1$1.thatReturnsNull = makeEmptyFunction$1(null);
emptyFunction$1$1.thatReturnsThis = function() {
  return this;
};
emptyFunction$1$1.thatReturnsArgument = function(arg) {
  return arg;
};

var emptyFunction_1$1 = emptyFunction$1$1;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat$1 = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat$1 = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant$1$1(condition, format, a, b, c, d, e, f) {
  validateFormat$1(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++];
        })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

var invariant_1$1 = invariant$1$1;

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning$1$1 = emptyFunction_1$1;

if (process.env.NODE_ENV !== 'production') {
  (function() {
    var printWarning = function printWarning(format) {
      for (
        var _len = arguments.length,
          args = Array(_len > 1 ? _len - 1 : 0),
          _key = 1;
        _key < _len;
        _key++
      ) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message =
        'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning$1$1 = function warning(condition, format) {
      if (format === undefined) {
        throw new Error(
          '`warning(condition, format, ...args)` requires a warning ' +
            'message argument'
        );
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (
          var _len2 = arguments.length,
            args = Array(_len2 > 2 ? _len2 - 2 : 0),
            _key2 = 2;
          _key2 < _len2;
          _key2++
        ) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

var warning_1$1 = warning$1$1;

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var ReactPropTypesSecret$1$1 = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

var ReactPropTypesSecret_1$1 = ReactPropTypesSecret$1$1;

if (process.env.NODE_ENV !== 'production') {
  var invariant$2$1 = invariant_1$1;
  var warning$2$1 = warning_1$1;
  var ReactPropTypesSecret$2$1 = ReactPropTypesSecret_1$1;
  var loggedTypeFailures$1 = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes$1$1(
  typeSpecs,
  values,
  location,
  componentName,
  getStack
) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant$2$1(
            typeof typeSpecs[typeSpecName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually from ' +
              'React.PropTypes.',
            componentName || 'React class',
            location,
            typeSpecName
          );
          error = typeSpecs[typeSpecName](
            values,
            typeSpecName,
            componentName,
            location,
            null,
            ReactPropTypesSecret$2$1
          );
        } catch (ex) {
          error = ex;
        }
        warning$2$1(
          !error || error instanceof Error,
          '%s: type specification of %s `%s` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a %s. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).',
          componentName || 'React class',
          location,
          typeSpecName,
          typeof error
        );
        if (
          error instanceof Error &&
          !(error.message in loggedTypeFailures$1)
        ) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures$1[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning$2$1(
            false,
            'Failed %s type: %s%s',
            location,
            error.message,
            stack != null ? stack : ''
          );
        }
      }
    }
  }
}

var checkPropTypes_1$1 = checkPropTypes$1$1;

var factoryWithTypeCheckers$1 = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn =
      maybeIterable &&
      ((ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL]) ||
        maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(
      isRequired,
      props,
      propName,
      componentName,
      location,
      propFullName,
      secret
    ) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret_1$1) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant_1$1(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
              'Use `PropTypes.checkPropTypes()` to call them. ' +
              'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (
          process.env.NODE_ENV !== 'production' &&
          typeof console !== 'undefined'
        ) {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning_1$1(
              false,
              'You are manually calling a React.PropTypes validation ' +
                'function for the `%s` prop on `%s`. This is deprecated ' +
                'and will throw in the standalone `prop-types` package. ' +
                'You may be seeing this warning due to a third-party PropTypes ' +
                'library. See https://fb.me/react-warning-dont-call-proptypes ' +
                'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError(
              'The ' +
                location +
                ' `' +
                propFullName +
                '` is marked as required ' +
                ('in `' + componentName + '`, but its value is `null`.')
            );
          }
          return new PropTypeError(
            'The ' +
              location +
              ' `' +
              propFullName +
              '` is marked as required in ' +
              ('`' + componentName + '`, but its value is `undefined`.')
          );
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(
      props,
      propName,
      componentName,
      location,
      propFullName,
      secret
    ) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              preciseType +
              '` supplied to `' +
              componentName +
              '`, expected ') +
            ('`' + expectedType + '`.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction_1$1.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError(
          'Property `' +
            propFullName +
            '` of component `' +
            componentName +
            '` has invalid PropType notation inside arrayOf.'
        );
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              propType +
              '` supplied to `' +
              componentName +
              '`, expected an array.')
        );
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(
          propValue,
          i,
          componentName,
          location,
          propFullName + '[' + i + ']',
          ReactPropTypesSecret_1$1
        );
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              propType +
              '` supplied to `' +
              componentName +
              '`, expected a single ReactElement.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              actualClassName +
              '` supplied to `' +
              componentName +
              '`, expected ') +
            ('instance of `' + expectedClassName + '`.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production'
        ? warning_1$1(
            false,
            'Invalid argument supplied to oneOf, expected an instance of array.'
          )
        : void 0;
      return emptyFunction_1$1.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError(
        'Invalid ' +
          location +
          ' `' +
          propFullName +
          '` of value `' +
          propValue +
          '` ' +
          ('supplied to `' +
            componentName +
            '`, expected one of ' +
            valuesString +
            '.')
      );
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError(
          'Property `' +
            propFullName +
            '` of component `' +
            componentName +
            '` has invalid PropType notation inside objectOf.'
        );
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type ' +
            ('`' +
              propType +
              '` supplied to `' +
              componentName +
              '`, expected an object.')
        );
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(
            propValue,
            key,
            componentName,
            location,
            propFullName + '.' + key,
            ReactPropTypesSecret_1$1
          );
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production'
        ? warning_1$1(
            false,
            'Invalid argument supplied to oneOfType, expected an instance of array.'
          )
        : void 0;
      return emptyFunction_1$1.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning_1$1(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
            'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction_1$1.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (
          checker(
            props,
            propName,
            componentName,
            location,
            propFullName,
            ReactPropTypesSecret_1$1
          ) == null
        ) {
          return null;
        }
      }

      return new PropTypeError(
        'Invalid ' +
          location +
          ' `' +
          propFullName +
          '` supplied to ' +
          ('`' + componentName + '`.')
      );
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` supplied to ' +
            ('`' + componentName + '`, expected a ReactNode.')
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            propType +
            '` ' +
            ('supplied to `' + componentName + '`, expected `object`.')
        );
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(
          propValue,
          key,
          componentName,
          location,
          propFullName + '.' + key,
          ReactPropTypesSecret_1$1
        );
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes_1$1;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

var factoryWithThrowingShims = function() {
  function shim(
    props,
    propName,
    componentName,
    location,
    propFullName,
    secret
  ) {
    if (secret === ReactPropTypesSecret_1$1) {
      // It is still safe when called from React.
      return;
    }
    invariant_1$1(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
        'Use PropTypes.checkPropTypes() to call them. ' +
        'Read more at http://fb.me/use-check-prop-types'
    );
  }
  shim.isRequired = shim;
  function getShim() {
    return shim;
  }
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction_1$1;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

var index$1$1 = createCommonjsModule$1(function(module) {
  /**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

  if (process.env.NODE_ENV !== 'production') {
    var REACT_ELEMENT_TYPE =
      (typeof Symbol === 'function' &&
        Symbol.for &&
        Symbol.for('react.element')) ||
      0xeac7;

    var isValidElement = function(object) {
      return (
        typeof object === 'object' &&
        object !== null &&
        object.$$typeof === REACT_ELEMENT_TYPE
      );
    };

    // By explicitly using `prop-types` you are opting into new development behavior.
    // http://fb.me/prop-types-in-prod
    var throwOnDirectAccess = true;
    module.exports = factoryWithTypeCheckers$1(
      isValidElement,
      throwOnDirectAccess
    );
  } else {
    // By explicitly using `prop-types` you are opting into new production behavior.
    // http://fb.me/prop-types-in-prod
    module.exports = factoryWithThrowingShims();
  }
});

var _templateObject$6 = taggedTemplateLiteral(
  [
    '\n    background-color: ',
    ';\n\n    &[href] {\n      &:hover {\n        background-color: ',
    ';\n      }\n    }\n  '
  ],
  [
    '\n    background-color: ',
    ';\n\n    &[href] {\n      &:hover {\n        background-color: ',
    ';\n      }\n    }\n  '
  ]
);

function badgeVariant(color) {
  return css(_templateObject$6, color, polished.darken(0.1, color));
}

var _templateObject$5 = taggedTemplateLiteral(
  [
    '\n  display: inline-block;\n  ',
    '\n  font-size: ',
    ';\n  font-weight: ',
    ';\n  line-height: 1;\n  color: ',
    ';\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  -styled-mixin: ',
    ';\n\n  /* Empty badges collapse automatically */\n  &:empty {\n    display: none;\n  }\n\n  ',
    '\n\n  ',
    '\n'
  ],
  [
    '\n  display: inline-block;\n  ',
    '\n  font-size: ',
    ';\n  font-weight: ',
    ';\n  line-height: 1;\n  color: ',
    ';\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  -styled-mixin: ',
    ';\n\n  /* Empty badges collapse automatically */\n  &:empty {\n    display: none;\n  }\n\n  ',
    '\n\n  ',
    '\n'
  ]
);
var _templateObject2$2 = taggedTemplateLiteral(
  ['\n    padding-right: ', ';\n    padding-left: ', ';\n    ', ';\n  '],
  ['\n    padding-right: ', ';\n    padding-left: ', ';\n    ', ';\n  ']
);

var Badge = styled.span(
  _templateObject$5,
  function(props) {
    return (
      'padding: ' +
      props.theme.badgePaddingY +
      ' ' +
      props.theme.badgePaddingX +
      ';'
    );
  },
  function(props) {
    return props.theme.badgeFontSize;
  },
  function(props) {
    return props.badgeFontWeight;
  },
  function(props) {
    return props.theme.badgeColor;
  },
  borderRadius(),
  function(_ref) {
    var theme = _ref.theme,
      color = _ref.color;

    switch (color) {
      case 'default':
        return badgeVariant(theme.badgeDefaultBg);
      case 'primary':
        return badgeVariant(theme.badgePrimaryBg);
      case 'success':
        return badgeVariant(theme.badgeSuccessBg);
      case 'info':
        return badgeVariant(theme.badgeInfoBg);
      case 'warning':
        return badgeVariant(theme.badgeWarningBg);
      case 'danger':
        return badgeVariant(theme.badgeDangerBg);
      default:
        return badgeVariant(theme.badgeDefaultBg);
    }
  },
  function(_ref2) {
    var theme = _ref2.theme,
      pill = _ref2.pill;
    return (
      pill &&
      css(
        _templateObject2$2,
        theme.badgePillPaddingX,
        theme.badgePillPaddingX,
        borderRadius(theme.badgePillBorderRadius)
      )
    );
  }
);

Badge.propTypes = {
  color: index$1$1.oneOf([
    'default',
    'primary',
    'success',
    'info',
    'warning',
    'danger'
  ]),
  pill: index$1$1.bool
};

Badge.defaultProps = {
  color: 'default',
  pill: false,
  theme: {
    badgeDefaultBg: badgeDefaultBg,
    badgePrimaryBg: badgePrimaryBg,
    badgeSuccessBg: badgeSuccessBg,
    badgeInfoBg: badgeInfoBg,
    badgeWarningBg: badgeWarningBg,
    badgeDangerBg: badgeDangerBg,

    badgeColor: badgeColor,
    badgeLinkHoverColor: badgeLinkHoverColor,
    badgeFontSize: badgeFontSize,
    badgeFontWeight: badgeFontWeight,
    badgePaddingY: badgePaddingY,
    badgePaddingX: badgePaddingX,

    badgePillPaddingX: badgePillPaddingX,
    badgePillBorderRadius: badgePillBorderRadius
  }
};

var _templateObject$7 = taggedTemplateLiteral(
  [
    '\n  ',
    ';\n  margin-bottom: 1rem;\n  list-style: none;\n  background-color: ',
    ';\n\n  ',
    ';\n  ',
    '\n'
  ],
  [
    '\n  ',
    ';\n  margin-bottom: 1rem;\n  list-style: none;\n  background-color: ',
    ';\n\n  ',
    ';\n  ',
    '\n'
  ]
);
var _templateObject2$3 = taggedTemplateLiteral(
  [
    '\n  float: left;\n\n  + :before {\n    display: inline-block;\n    padding-right: ',
    ';\n    padding-left: ',
    ';\n    color: ',
    ';\n    content: ',
    ';\n  }\n\n  &:hover::before {\n    text-decoration: underline;\n  }\n\n  &:hover::before {\n    text-decoration: none;\n  }\n\n  ',
    '\n'
  ],
  [
    '\n  float: left;\n\n  + :before {\n    display: inline-block;\n    padding-right: ',
    ';\n    padding-left: ',
    ';\n    color: ',
    ';\n    content: ',
    ';\n  }\n\n  &:hover::before {\n    text-decoration: underline;\n  }\n\n  &:hover::before {\n    text-decoration: none;\n  }\n\n  ',
    '\n'
  ]
);

var Breadcrumb = styled.div(
  _templateObject$7,
  function(_ref) {
    var theme = _ref.theme;
    return (
      'padding: ' +
      theme.breadcrumbPaddingY +
      ' ' +
      theme.breadcrumbPaddingX +
      ';'
    );
  },
  function(props) {
    return props.theme.breadcrumbBg;
  },
  function(props) {
    return borderRadius(props.theme.bordeRadius);
  },
  polished.clearFix()
);

Breadcrumb.Item = styled.a(
  _templateObject2$3,
  function(_ref2) {
    var theme = _ref2.theme;
    return theme.breadcrumbItemPadding;
  },
  function(_ref3) {
    var theme = _ref3.theme;
    return theme.breadcrumbItemPadding;
  },
  function(_ref4) {
    var theme = _ref4.theme;
    return theme.breadcrumbDividerColor;
  },
  function(_ref5) {
    var theme = _ref5.theme;
    return theme.breadcrumbDivider;
  },
  function(_ref6) {
    var active = _ref6.active,
      theme = _ref6.theme;
    return active && 'color: ' + theme.breadcrumbActiveColor + ' !important;';
  }
);

var theme = {
  breadcrumbPaddingY: breadcrumbPaddingY,
  breadcrumbPaddingX: breadcrumbPaddingX,
  breadcrumbItemPadding: breadcrumbItemPadding,
  breadcrumbBg: breadcrumbBg,
  breadcrumbDividerColor: breadcrumbDividerColor,
  breadcrumbActiveColor: breadcrumbActiveColor,
  breadcrumbDivider: breadcrumbDivider
};

Breadcrumb.defaultProps = { theme: theme };
Breadcrumb.Item.defaultProps = { theme: theme };

var _templateObject$10 = taggedTemplateLiteral(
  ['\n      box-shadow: ', ';\n    '],
  ['\n      box-shadow: ', ';\n    ']
);

var boxShadow = function boxShadow(shadow) {
  if (enableShadows) {
    return css(_templateObject$10, shadow);
  }
};

var _templateObject$9 = taggedTemplateLiteral(
  [
    '\n    color: ',
    ';\n    background-color: ',
    ';\n    border-color: ',
    ';\n\n    ',
    '\n\n    // Hover and focus styles are shared\n    ',
    '\n\n    &:focus,\n    &.focus {\n      // Avoid using mixin so we can pass custom focus shadow properly\n      // @if $enable-shadows {\n      //   box-shadow: $btn-box-shadow, 0 0 0 2px rgba(',
    ', .5);\n      // } @else {\n      //   box-shadow: 0 0 0 2px rgba(',
    ', .5);\n      // }\n    }\n\n    // Disabled comes first so active can properly restyle\n    &.disabled,\n    &:disabled {\n      background-color: ',
    ';\n      border-color: ',
    ';\n    }\n\n    &:active,\n    &.active,\n    .show > &.dropdown-toggle {\n      color: ',
    ';\n      background-color: ',
    ';\n      background-image: none; // Remove the gradient for the pressed/active state\n      border-color: ',
    ';\n      // @include box-shadow($btn-active-box-shadow);\n    }\n  '
  ],
  [
    '\n    color: ',
    ';\n    background-color: ',
    ';\n    border-color: ',
    ';\n\n    ',
    '\n\n    // Hover and focus styles are shared\n    ',
    '\n\n    &:focus,\n    &.focus {\n      // Avoid using mixin so we can pass custom focus shadow properly\n      // @if $enable-shadows {\n      //   box-shadow: $btn-box-shadow, 0 0 0 2px rgba(',
    ', .5);\n      // } @else {\n      //   box-shadow: 0 0 0 2px rgba(',
    ', .5);\n      // }\n    }\n\n    // Disabled comes first so active can properly restyle\n    &.disabled,\n    &:disabled {\n      background-color: ',
    ';\n      border-color: ',
    ';\n    }\n\n    &:active,\n    &.active,\n    .show > &.dropdown-toggle {\n      color: ',
    ';\n      background-color: ',
    ';\n      background-image: none; // Remove the gradient for the pressed/active state\n      border-color: ',
    ';\n      // @include box-shadow($btn-active-box-shadow);\n    }\n  '
  ]
);
var _templateObject2$5 = taggedTemplateLiteral(
  ['\n      inset 0 1px 0 rgba(', ', 0.15), 0 1px 1px rgba(', ', 0.075)\n    '],
  ['\n      inset 0 1px 0 rgba(', ', 0.15), 0 1px 1px rgba(', ', 0.075)\n    ']
);
var _templateObject3$3 = taggedTemplateLiteral(
  [
    '\n      color: ',
    ';\n      background-color: ',
    ';\n      border-color: ',
    ';\n    '
  ],
  [
    '\n      color: ',
    ';\n      background-color: ',
    ';\n      border-color: ',
    ';\n    '
  ]
);
var _templateObject4$3 = taggedTemplateLiteral(
  [
    '\n    color: ',
    ';\n    background-image: none;\n    background-color: transparent;\n    border-color: ',
    ';\n\n    ',
    ';\n\n    &:focus,\n    &.focus {\n      box-shadow: 0 0 0 2px rgba(',
    ', .5);\n    }\n\n    &.disabled,\n    &:disabled {\n      color: ',
    ';\n      background-color: transparent;\n    }\n\n    &:active,\n    &.active,\n    .show > &.dropdown-toggle {\n      color: ',
    ';\n      background-color: ',
    ';\n      border-color: ',
    ';\n    }\n  '
  ],
  [
    '\n    color: ',
    ';\n    background-image: none;\n    background-color: transparent;\n    border-color: ',
    ';\n\n    ',
    ';\n\n    &:focus,\n    &.focus {\n      box-shadow: 0 0 0 2px rgba(',
    ', .5);\n    }\n\n    &.disabled,\n    &:disabled {\n      color: ',
    ';\n      background-color: transparent;\n    }\n\n    &:active,\n    &.active,\n    .show > &.dropdown-toggle {\n      color: ',
    ';\n      background-color: ',
    ';\n      border-color: ',
    ';\n    }\n  '
  ]
);
var _templateObject5$3 = taggedTemplateLiteral(
  [
    '\n    padding: ',
    ' ',
    ';\n    font-size: ',
    ';\n    line-height: ',
    ';\n    ',
    '\n  '
  ],
  [
    '\n    padding: ',
    ' ',
    ';\n    font-size: ',
    ';\n    line-height: ',
    ';\n    ',
    '\n  '
  ]
);

function buttonVariant(color, background, border) {
  var activeBackground = polished.darken(0.1, background);
  var activeBorder = polished.darken(0.12, border);

  return css(
    _templateObject$9,
    color,
    background,
    border,
    boxShadow(css(_templateObject2$5, white, black)),
    hover(css(_templateObject3$3, color, activeBackground, activeBorder)),
    border,
    border,
    background,
    border,
    color,
    activeBackground,
    activeBorder
  );
}

function buttonOutlineVariant(color) {
  var colorHover = arguments.length > 1 && arguments[1] !== undefined
    ? arguments[1]
    : '#fff';

  return css(
    _templateObject4$3,
    color,
    color,
    hover(css(_templateObject3$3, colorHover, color, color)),
    color,
    color,
    colorHover,
    color,
    color
  );
}

function buttonSize(paddingY, paddingX, fontSize, lineHeight, radius) {
  return css(
    _templateObject5$3,
    paddingY,
    paddingX,
    fontSize,
    lineHeight,
    borderRadius(radius)
  );
}

var _templateObject$11 = taggedTemplateLiteral(
  ['\n      transition: ', ';\n    '],
  ['\n      transition: ', ';\n    ']
);
var _templateObject2$6 = taggedTemplateLiteral(
  ['\n      transition: ', ';\n  '],
  ['\n      transition: ', ';\n  ']
);

var transition = function transition(_transition) {
  if (enableTransitions) {
    return css(_templateObject$11, transitionBase);
  }

  return css(_templateObject2$6, _transition);
};

var _templateObject$8 = taggedTemplateLiteral(
  [
    '\n  display: inline-block;\n  font-weight: ',
    ';\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  user-select: none;\n  border: ',
    ' solid transparent;\n\n  ',
    '\n\n  ',
    '\n\n  // Share hover and focus styles\n  ',
    '\n\n  &:focus,\n  &.focus {\n    outline: 0;\n    box-shadow: ',
    ';\n  }\n\n  &.disabled,\n  &:disabled {\n    cursor: ',
    ';\n    opacity: .65;\n    // @include box-shadow(none);\n  }\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n'
  ],
  [
    '\n  display: inline-block;\n  font-weight: ',
    ';\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  user-select: none;\n  border: ',
    ' solid transparent;\n\n  ',
    '\n\n  ',
    '\n\n  // Share hover and focus styles\n  ',
    '\n\n  &:focus,\n  &.focus {\n    outline: 0;\n    box-shadow: ',
    ';\n  }\n\n  &.disabled,\n  &:disabled {\n    cursor: ',
    ';\n    opacity: .65;\n    // @include box-shadow(none);\n  }\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n\n  ',
    '\n'
  ]
);
var _templateObject2$4 = taggedTemplateLiteral(
  ['\n    text-decoration: none;\n  '],
  ['\n    text-decoration: none;\n  ']
);
var _templateObject3$2 = taggedTemplateLiteral(
  [
    '\n    font-weight: ',
    ';\n    color: ',
    ';\n    border-radius: 0;\n\n    &,\n    &:active,\n    &.active,\n    &:disabled {\n      background-color: transparent;\n      /** @include box-shadow(none); */\n    }\n\n    &,\n    &:focus,\n    &:active {\n      border-color: transparent;\n    }\n\n    ',
    '\n\n    ',
    '\n\n    &:disabled {\n      color: ',
    ';\n\n      ',
    '\n    }\n  '
  ],
  [
    '\n    font-weight: ',
    ';\n    color: ',
    ';\n    border-radius: 0;\n\n    &,\n    &:active,\n    &.active,\n    &:disabled {\n      background-color: transparent;\n      /** @include box-shadow(none); */\n    }\n\n    &,\n    &:focus,\n    &:active {\n      border-color: transparent;\n    }\n\n    ',
    '\n\n    ',
    '\n\n    &:disabled {\n      color: ',
    ';\n\n      ',
    '\n    }\n  '
  ]
);
var _templateObject4$2 = taggedTemplateLiteral(
  ['\n      border-color: transparent;\n    '],
  ['\n      border-color: transparent;\n    ']
);
var _templateObject5$2 = taggedTemplateLiteral(
  [
    '\n      color: ',
    ';\n      text-decoration: ',
    ';\n      background-color: transparent;\n    '
  ],
  [
    '\n      color: ',
    ';\n      text-decoration: ',
    ';\n      background-color: transparent;\n    '
  ]
);
var _templateObject6$1 = taggedTemplateLiteral(
  ['\n        text-decoration: none;\n      '],
  ['\n        text-decoration: none;\n      ']
);
var _templateObject7$1 = taggedTemplateLiteral(
  ['\n    background-image: none;\n    // ', '\n  '],
  ['\n    background-image: none;\n    // ', '\n  ']
);
var _templateObject8 = taggedTemplateLiteral(
  ['\n    display: block;\n    width: 100%;\n  '],
  ['\n    display: block;\n    width: 100%;\n  ']
);

var Button = styled.button(
  _templateObject$8,
  function(props) {
    return props.theme.btnFontWeight;
  },
  function(props) {
    return props.theme.inputBtnBorderWidth;
  },
  function(props) {
    return (
      !props.size &&
      buttonSize(
        props.theme.inputBtnPaddingY,
        props.theme.inputBtnPaddingX,
        props.theme.fontSizeBase,
        props.theme.inputBtnLineHeight,
        props.theme.btnBorderRadius
      )
    );
  },
  function(props) {
    return transition(props.theme.btnTransition);
  },
  hoverFocus(css(_templateObject2$4)),
  function(props) {
    return props.theme.btnFocusBoxShadow;
  },
  function(props) {
    return props.theme.cursorDisabled;
  },
  function(_ref) {
    var theme = _ref.theme,
      color = _ref.color;

    switch (color) {
      case 'primary':
        return buttonVariant(
          theme.btnPrimaryColor,
          theme.btnPrimaryBg,
          theme.btnPrimaryBorderColor
        );
      case 'secondary':
        return buttonVariant(
          theme.btnSecondaryColor,
          theme.btnSecondaryBg,
          theme.btnSecondaryBorderColor
        );
      case 'info':
        return buttonVariant(
          theme.btnInfoColor,
          theme.btnInfoBg,
          theme.btnInfoBorderColor
        );
      case 'success':
        return buttonVariant(
          theme.btnSuccessColor,
          theme.btnSuccessBg,
          theme.btnSuccessBorderColor
        );
      case 'warning':
        return buttonVariant(
          theme.btnWarningColor,
          theme.btnWarningBg,
          theme.btnWarningBorderColor
        );
      case 'danger':
        return buttonVariant(
          theme.btnDangerColor,
          theme.btnDangerBg,
          theme.btnDangerBorderColor
        );
      default:
        return null;
    }
  },
  function(props) {
    return (
      props.color === 'link' &&
      css(
        _templateObject3$2,
        function(props) {
          return props.theme.fontWeightNormal;
        },
        function(props) {
          return props.theme.linkColor;
        },
        hover(css(_templateObject4$2)),
        hoverFocus(
          css(
            _templateObject5$2,
            function(props) {
              return props.theme.linkHoverColor;
            },
            function(props) {
              return props.theme.linkHoverDecoration;
            }
          )
        ),
        btnLinkDisabledColor,
        hoverFocus(css(_templateObject6$1))
      )
    );
  },
  function(_ref2) {
    var theme = _ref2.theme,
      outline = _ref2.outline,
      color = _ref2.color;

    if (outline) {
      switch (color) {
        case 'primary':
          return buttonOutlineVariant(theme.btnPrimaryBg);
        case 'secondary':
          return buttonOutlineVariant(theme.btnSecondaryBorder);
        case 'info':
          return buttonOutlineVariant(theme.btnInfoBg);
        case 'success':
          return buttonOutlineVariant(theme.btnSuccessBg);
        case 'warning':
          return buttonOutlineVariant(theme.btnWarningBg);
        case 'danger':
          return buttonOutlineVariant(theme.btnDangerBg);
        default:
          return null;
      }
    }
  },
  function(props) {
    return (
      props.size === 'large' &&
      buttonSize(
        props.theme.inputBtnPaddingYlg,
        props.theme.inputBtnPaddingXlg,
        props.theme.fontSizeLg,
        props.theme.inputBtnLineHeightLg,
        props.theme.btnBorderRadiusLg
      )
    );
  },
  function(props) {
    return (
      props.size === 'small' &&
      buttonSize(
        props.theme.inputBtnPaddingYsm,
        props.theme.inputBtnPaddingXsm,
        props.theme.fontSizeSm,
        props.theme.inputBtnLineHeightSm,
        props.theme.btnBorderRadiusSm
      )
    );
  },
  function(props) {
    return (
      props.active &&
      css(_templateObject7$1, boxShadow(props.theme.btnFocusBoxShadow))
    );
  },
  function(props) {
    return props.block && css(_templateObject8);
  }
);

Button.Link = Button.withComponent('a');

Button.defaultProps = {
  theme: {
    inputBtnPaddingY: inputBtnPaddingY,
    inputBtnPaddingX: inputBtnPaddingX,
    inputBtnLineHeight: inputBtnLineHeight,
    inputBtnPaddingYsm: inputBtnPaddingYsm,
    inputBtnPaddingXsm: inputBtnPaddingXsm,
    inputBtnLineHeightSm: inputBtnLineHeightSm,
    inputBtnPaddingYlg: inputBtnPaddingYlg,
    inputBtnPaddingXlg: inputBtnPaddingXlg,
    inputBtnLineHeightLg: inputBtnLineHeightLg,
    btnFontWeight: btnFontWeight,
    btnBoxShadow: btnBoxShadow,
    btnFocusBoxShadow: btnFocusBoxShadow,
    btnActiveBoxShadow: btnActiveBoxShadow,
    btnPrimaryColor: btnPrimaryColor,
    btnPrimaryBg: btnPrimaryBg,
    btnPrimaryBorderColor: btnPrimaryBorderColor,
    btnSecondaryColor: btnSecondaryColor,
    btnSecondaryBg: btnSecondaryBg,
    btnSecondaryBorderColor: btnSecondaryBorderColor,
    btnInfoColor: btnInfoColor,
    btnInfoBg: btnInfoBg,
    btnInfoBorderColor: btnInfoBorderColor,
    btnSuccessColor: btnSuccessColor,
    btnSuccessBg: btnSuccessBg,
    btnSuccessBorderColor: btnSuccessBorderColor,
    btnWarningColor: btnWarningColor,
    btnWarningBg: btnWarningBg,
    btnWarningBorderColor: btnWarningBorderColor,
    btnDangerColor: btnDangerColor,
    btnDangerBg: btnDangerBg,
    btnDangerBorderColor: btnDangerBorderColor,
    btnLinkDisabledColor: btnLinkDisabledColor,
    btnBlockSpacingY: btnBlockSpacingY,
    btnBorderRadius: btnBorderRadius,
    btnBorderRadiusLg: btnBorderRadiusLg,
    btnBorderRadiusSm: btnBorderRadiusSm,
    btnTransition: btnTransition,
    fontSizeBase: fontSizeBase,
    inputBtnBorderWidth: inputBtnBorderWidth,
    fontSizeLg: fontSizeLg,
    fontSizeSm: fontSizeSm,
    fontWeightNormal: fontWeightNormal,
    linkColor: linkColor
  }
};

exports.Alert = Alert;
exports.Badge = Badge;
exports.Breadcrumb = Breadcrumb;
exports.Button = Button;
