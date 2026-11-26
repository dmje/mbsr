
## Day pages and navigation (second pass, November 2026)

- [x] 56 new day pages, seven per week for all eight weeks, in "Course Workbook/Week N/Week N - Day D.md". Each has the day's formal practice, informal practice, and a short fallback for days that go sideways. Frontmatter: author Mistral, title "Day D". Home practice follows the week's actual assignments (body scan weeks 1-2, mindful movement weeks 3-4, breathing from week 5, choice-based week 7, increasingly unguided week 8; the unguided day is week 7 day 4; the practice plan is written week 8 days 5-7)
- [x] Overall Structure - every week now lists its day pages after its content pages, plus a Practices section for the five transcripts and a Supporting Materials section
- [x] site/build.mjs - pages now build nested URLs from their folder path (/course-workbook-week-1/week-1-day-1), nav display titles use the title frontmatter where present, and nav items sort: numbered content pages first in numeric order, then Day 1-7 last within each week
- [x] Prototype site published to Spacefast (celestial-castle.space.fast) with the new structure

## Still needs you

- [ ] The weeks 2-6 content pages themselves do not yet mention the day pages; if the day pages stay, the week "Home practice" pages should probably point to them
- [ ] Recording the walking meditation and mindful movement audio (unchanged)
- [ ] The 21 flat pages from the first prototype build still live at their old URLs but are unlinked; a future snapshot publish from this repo will replace them
