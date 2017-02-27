/* Pedro Trindade - Nº 41661
Diana Duarte - N+ 41940 */
/* O trabalho está resolvido na integra, mas a rotação dos rotores central e esquerdo
(mais perto do refletor) apresentam um erro na sua rotação */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ROTOR_SIZE 26

typedef struct {
    char start;
    int rotation;
    char rotor[ROTOR_SIZE];
} Rotor;


/* Função que calcula o caminho desde o primeiro rotor até ao reflector. */
int toReflector(int input, Rotor l_rotor, Rotor c_rotor, Rotor r_rotor) {
    int c = input - 'A';
	int r_offset = r_rotor.start - 'A';
	int c_offset = c_rotor.start - 'A';
	int l_offset = l_rotor.start - 'A';
	int r_rotation = r_offset;
	int c_rotation = c_offset;
    int l_rotation = l_offset;

	if((r_rotation += c) >= ROTOR_SIZE)
		r_rotation -= ROTOR_SIZE;

    int right = (r_rotor.rotor[r_rotation] - r_offset) - 'A';
	if(right < 0)
		right += ROTOR_SIZE;

	if((c_rotation += right) >= ROTOR_SIZE)
		c_rotation -= ROTOR_SIZE;

    int center = (c_rotor.rotor[c_rotation] - c_offset) - 'A';
	if(center < 0)
		center += ROTOR_SIZE;

	if((l_rotation += center) >= ROTOR_SIZE)
		l_rotation -= ROTOR_SIZE;

    int left = (l_rotor.rotor[l_rotation] - l_offset) - 'A';
	if(left < 0)
		left += ROTOR_SIZE;

    return left;
}

/* Função que calcula a reflexão do input dado. */
int reflect(int input, char reflector[]) {
    char r = reflector[input];
    int i, result;

    for(i = 0; i < strlen(reflector); i++) {
        if(r == reflector[i] && i != input)
            result = i;
    }

    return result;
}

/* Função que calcula o caminho desde o reflector até ao output desejado. */
int fromReflector(int input, Rotor l_rotor, Rotor c_rotor, Rotor r_rotor) {
    int c = input;
    int i, left, center, right;
    int l_offset = l_rotor.start - 'A';
    int c_offset = c_rotor.start - 'A';
    int r_offset = r_rotor.start - 'A';

	c += l_offset;
	if(c >= ROTOR_SIZE)
		c -= ROTOR_SIZE;

    for(i = 0; i < ROTOR_SIZE ; i++) {
        if(c == (l_rotor.rotor[i] - 'A'))
            left = i;
    }

	left -= l_offset;
	if(left < 0)
		left += ROTOR_SIZE;

	left += c_offset;
	if(left >= ROTOR_SIZE)
		left -= ROTOR_SIZE;

    for(i = 0; i < ROTOR_SIZE; i++) {
        if(left == (c_rotor.rotor[i] - 'A'))
            center = i;
    }

	center -= c_offset;
	if(center < 0)
		center += ROTOR_SIZE;

	center += r_offset;
	if(center >= ROTOR_SIZE)
		center -= ROTOR_SIZE;

    for(i = 0; i < ROTOR_SIZE; i++) {
        if(center == (r_rotor.rotor[i] - 'A'))
            right = i;
    }

	right -= r_offset;
	if(right < 0)
		right += ROTOR_SIZE;

    return (right + 'A');
}

int main (int argc, char* argv[]) {
    Rotor l_rotor;
    Rotor c_rotor;
    Rotor r_rotor;
    char reflector[ROTOR_SIZE];
    int i_number;
    char asterisk;
    int a, b, i, in, out, rotates, l_rotates, c_rotates, r_rotates;
    int c_approved = 0;
    int l_approved = 0;

    scanf("%s", l_rotor.rotor);
    scanf("%d", &l_rotor.rotation);
    scanf("%s", c_rotor.rotor);
    scanf("%d", &c_rotor.rotation);
    scanf("%s", r_rotor.rotor);
    scanf("%d", &r_rotor.rotation);
    scanf("%s", reflector);
    scanf("%d", &i_number);
    getchar();

    for(i = 0; i < i_number; i++) {
        scanf("%c", &l_rotor.start);
        scanf("%c", &c_rotor.start);
        scanf("%c", &r_rotor.start);
        scanf("%c", &asterisk);

        r_rotates = r_rotor.start - 'A';
        c_rotates = c_rotor.start - 'A';
        l_rotates = l_rotor.start - 'A';

        if(asterisk == '*') {
            rotates = 0;
            getchar();
        }
        else
            rotates = 1;

        char c = fgetc(stdin);
        while(c != '\n') {
            in = c;
            if(rotates) {
                if(r_rotor.start == 'Z') {
                    r_rotates = 0;
                    r_rotor.start = 'A';
                }
                else {
                    r_rotates += 1;
                    r_rotor.start += 1;
                }
            }
            a = toReflector(in, l_rotor, c_rotor, r_rotor);
            b = reflect(a, reflector);
            out = fromReflector(b, l_rotor, c_rotor, r_rotor);
            c = (char)out;
            printf("%c", out);

            if(rotates) {
                if(r_rotates == r_rotor.rotation) {
                    c_approved++;

                    if(c_rotor.start == 'Z') {
                    c_rotates = 0;
                    c_rotor.start = 'A';
                    }
                else {
                    c_rotates += 1;
                    c_rotor.start += 1;
                }
            }

            if(c_rotor.rotation == c_rotates && c_approved) {
                c_approved = 0;
                l_approved++;
                if(c_rotor.start == 'Z') {
                    c_rotates = 0;
                    c_rotor.start = 'A';
                }
                else {
                    c_rotates += 1;
                    c_rotor.start += 1;
                }

                if(l_rotor.start == 'Z') {
                    l_rotates = 0;
                    l_rotor.start = 'A';
                }
                else {
                    l_rotates += 1;
                    l_rotor.start += 1;
                }
            }

            if(l_rotates == l_rotor.rotation && l_approved) {
                l_approved = 0;
                if(l_rotor.start == 'Z')
                    l_rotor.start = 'A';
                else
                    l_rotor.start += 1;
                }
            }
            c = fgetc(stdin);
        }
        printf("\n");
    }
    return 0;
}
