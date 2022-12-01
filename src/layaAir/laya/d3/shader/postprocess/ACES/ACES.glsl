// Academy Color Encoding System (ACES) software and tools are provided by the
// Academy under the following terms and conditions: A worldwide, royalty-free,
// non-exclusive right to copy, modify, create derivatives, and use, in source
// and binary forms, is hereby granted, subject to acceptance of this license.

// Copyright 2019 Academy of Motion Picture Arts and Sciences (A.M.P.A.S.).
// Portions contributed by others as indicated. All rights reserved.

// Performance of any of the aforementioned acts indicates acceptance to be
// bound by the following terms and conditions:

// Copies of source code, in whole or in part, must retain the above copyright
// notice, this list of conditions and the Disclaimer of Warranty.

// Use in binary form must retain the above copyright notice, this list of
// conditions and the Disclaimer of Warranty in the documentation and/or other
// materials provided with the distribution.

// Nothing in this license shall be deemed to grant any rights to trademarks,
// copyrights, patents, trade secrets or any other intellectual property of
// A.M.P.A.S. or any contributors, except as expressly stated herein.

// Neither the name "A.M.P.A.S." nor the name of any other contributors to this
// software may be used to endorse or promote products derivative of or based on
// this software without express prior written permission of A.M.P.A.S. or the
// contributors, as appropriate.

// This license shall be construed pursuant to the laws of the State of
// California, and any disputes related thereto shall be subject to the
// jurisdiction of the courts therein.

// Disclaimer of Warranty: THIS SOFTWARE IS PROVIDED BY A.M.P.A.S. AND
// CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT
// NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE, AND NON-INFRINGEMENT ARE DISCLAIMED. IN NO EVENT SHALL
// A.M.P.A.S., OR ANY CONTRIBUTORS OR DISTRIBUTORS, BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, RESITUTIONARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, THE ACADEMY SPECIFICALLY
// DISCLAIMS ANY REPRESENTATIONS OR WARRANTIES WHATSOEVER RELATED TO PATENT OR
// OTHER INTELLECTUAL PROPERTY RIGHTS IN THE ACADEMY COLOR ENCODING SYSTEM, OR
// APPLICATIONS THEREOF, HELD BY PARTIES OTHER THAN A.M.P.A.S.,WHETHER DISCLOSED
// OR UNDISCLOSED.

#if !defined(ACES_lib)
#define ACES_lib

#include "ACES_TransformCommon.glsl";
#include "ACES_UtillitiesColor.glsl";
#include "ACES_Tonescales.glsl";

#include "ACES_RRT.glsl";
#include "ACES_ODT_sRGB_100nits.glsl";

// idt

// linear D65 sRGB to D60 ACES AP0
vec3 sRGB_to_AP0(vec3 sRGB)
{
    return sRGB_to_AP0_MAT * sRGB;
}

// linear D65 sRGB to D60 ACES AP1
vec3 sRGB_to_AP1(vec3 sRGB)
{
    return sRGB_to_AP1_MAT * sRGB;
}

// lmt
// todo

#endif // ACES_lib