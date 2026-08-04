"""The small amount of markdown the site's content uses, turned into HTML.

Craig writes in a rich editor and never types a tag, so what gets saved is
markdown. This converts it back to the markup the pages have always used.

Deliberately tiny: italics, bold and links, which is all the content contains.
A full markdown library would also rewrite quotes, dashes and entities, and
those are typeset deliberately here.
"""
import re


def md(text):
    s = text or ""
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    s = re.sub(r"(?<!\w)\*\*([^*]+)\*\*(?!\w)", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\w)\*([^*]+)\*(?!\w)", r"<em>\1</em>", s)
    return s.strip()


def to_md(html):
    """The reverse, for migrating existing content into the editor."""
    s = html or ""
    s = re.sub(r"<strong>(.*?)</strong>", r"**\1**", s, flags=re.S)
    s = re.sub(r"<em>(.*?)</em>", r"*\1*", s, flags=re.S)
    s = re.sub(r'<a href="([^"]+)"[^>]*>(.*?)</a>', r"[\2](\1)", s, flags=re.S)
    return s.strip()
