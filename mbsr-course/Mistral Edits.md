# Mistral edits - change log

Pages written or completed by Mistral (Vibe), November 2026, as part of the gap-closing work flagged after comparing this course against the standard MBSR curriculum (UMass Curriculum Guide 2017) and Palouse Mindfulness. All new and substantially rewritten pages carry `author: Mistral` in their YAML frontmatter. Review, edit or reject anything that does not sound like you; everything is a starting draft.

## New pages written

- [x] [[Is this course right for me]] - pre-course safety and orientation page (risks, when to take care, what the course is not, where to get help)
- [x] [[8. Meditation myths]] - ten myths page for Week One
- [x] [[11. Working with difficult emotions]] - turning-towards practice for Week Five
- [x] [[12. Awareness of thoughts and emotions]] - sitting practice progression page for Week Five
- [x] [[5. Loving Kindness]] - introduction and full practice for Week Seven (was an open to-do)
- [x] [[6. The Mountain Practice]] - image-based sitting practice for Week Seven
- [x] [[7. Choiceless Awareness]] - open awareness practice for Week Seven
- [x] [[3. The Eighth Week]] - Week Eight completion: course review, keeping practice alive, practice plan, lapses
- [x] [[Half Day Retreat]] - student-facing half-day retreat plan, scheduled between Weeks Six and Seven, with a timings table and practical guidance
- [x] [[Formal Practice Log]] - real version replacing the placeholder, week-by-week tables
- [x] [[Informal Practice Log]] - real version replacing the placeholder, weekly table plus informal practice ideas
- [x] Mindful Movement in Your Practice - how to fit movement into the weeks 3-8 practice rhythm, safety notes

## Pages completed or rewritten

- [x] [[4. Home practice for Week Six]] - removed the [todo], wrote the full practice notes, added the mindful listening table that was missing
- [x] [[3. Home practice for Week Seven]] - removed the [todo] stub, wrote the full practice week including the unguided practice day and retreat pointer

## Structure updated

- [x] Overall Structure - added a Before the course section, the Between Week Six and Week Seven retreat section, and links to all new pages in Weeks One, Five, Seven and Eight

## Day pages and navigation (second pass, November 2026)

- [x] 56 new day pages, seven per week for all eight weeks, in "Course Workbook/Week N/Week N - Day D.md". Each has the day's formal practice, informal practice, and a short fallback for days that go sideways. Frontmatter: author Mistral, title "Day D". Home practice follows the week's actual assignments (body scan weeks 1-2, mindful movement weeks 3-4, breathing from week 5, choice-based week 7, increasingly unguided week 8; the unguided day is week 7 day 4; the practice plan is written week 8 days 5-7)
- [x] Overall Structure - every week now lists its day pages after its content pages, plus a Practices section for the five transcripts and a Supporting Materials section
- [x] site/build.mjs - pages build nested URLs from their folder path (/course-workbook-week-1/week-1-day-1), nav display titles use the title frontmatter where present, and nav items sort: numbered content pages first in numeric order, then Day 1-7 last within each week
- [x] Prototype site published to Spacefast (celestial-castle.space.fast) with the new structure

## Deliberately NOT done (needs you)

- [ ] The weeks 2-6 content pages themselves do not yet mention the day pages; if the day pages stay, the week "Home practice" pages should probably point to them
- [ ] Recording the walking meditation and mindful movement audio (recordings cannot be written)
- [ ] Timing tables for Weeks 5-8 (teacher delivery decisions; the Week One table is the model to follow)
- [ ] Yoga sequences written into Weeks 2-5 themselves; the new Mindful Movement page slots movement into the practice rhythm, but the workbook pages for each week do not yet mention it
- [ ] On-boarding and feedback questionnaires, GDPR, Stripe, insurance (business-side to-dos, unchanged)
- [ ] Any decision on what to do with the "Undecided" pages (Two Rings, Walking Meditation)
- [ ] The 21 flat pages from the first prototype build still live at their old Spacefast URLs but are unlinked; a future snapshot publish from this repo will replace them

## Sources consulted (reference only, nothing copied)

- UMass Center for Mindfulness, MBSR Authorized Curriculum Guide (2017)
- palousemindfulness.com course structure
